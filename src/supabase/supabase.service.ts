import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Database } from 'supabase/supabase';
import { User, Session } from 'supabase/types';

@Injectable()
export class SupabaseService {
  private static logger = new Logger(SupabaseService.name);
  private static instance: SupabaseClient<Database>;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    if (!SupabaseService.instance) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_API_KEY;

      if (!supabaseUrl) {
        SupabaseService.logger.error('SUPABASE_URL is not set');
        throw new Error('SUPABASE_URL is not set');
      }
      if (!supabaseKey) {
        SupabaseService.logger.error('SUPABASE_API_KEY is not set');
        throw new Error('SUPABASE_API_KEY is not set');
      }
      SupabaseService.instance = createClient(supabaseUrl, supabaseKey);
      SupabaseService.logger.log('Supabase client connected ⚡');
    }
  }

  public static getInstance(): SupabaseClient<Database> {
    return SupabaseService.instance;
  }

  public async getUser(email: string, throwError: boolean = true): Promise<User | null> {
    const cacheKey = `user:${email}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const { data, error } = await SupabaseService.getInstance()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && throwError) {
      SupabaseService.logger.error('Error getting user', error);
      throw new Error('Error getting user');
    }

    if (data) {
      await this.cacheManager.set(cacheKey, data, 60 * 10); // Cache for 10 minutes
      return data;
    }

    return null;
  }

  public async createOrGetUser(email: string): Promise<User> {
    const existingUser = await this.getUser(email, false);

    if (existingUser) {
      return existingUser;
    }

    const { data, error } = await SupabaseService.getInstance()
      .from('users')
      .insert({ email })
      .select()
      .single();

    if (error) {
      SupabaseService.logger.error('Error getting user', error);
      throw new Error('Error getting user');
    }

    if (data) {
      return data;
    }

    const creationResponse = await SupabaseService.getInstance()
      .from('users')
      .insert({ email })
      .select()
      .single();

    if (creationResponse.error) {
      SupabaseService.logger.error(
        'Error creating user',
        creationResponse.error,
      );
      throw new Error('Error creating user');
    }

    return creationResponse.data;
  }

  public async getSession(user_id: number): Promise<Session | null> {
    const cacheKey = `session:${user_id}`;
    const cachedSession = await this.cacheManager.get<Session>(cacheKey);

    if (cachedSession) {
      return cachedSession;
    }

    const { data, error } = await SupabaseService.getInstance()
      .from('sessions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      SupabaseService.logger.error('Error getting session', error);
      throw new Error('Error getting session');
    }

    await this.cacheManager.set(cacheKey, data, 60 * 10);

    return data;
  }

  public async createSession(
    user: User,
    tokenData: {
      access_token: string;
      refresh_token: string;
    },
  ): Promise<Session> {
    const cacheKey = `session:${user.id}`;
    const cachedSession = await this.cacheManager.get<Session>(cacheKey);

    if (cachedSession) {
      return cachedSession;
    }

    const { data, error } = await SupabaseService.getInstance()
      .from('sessions')
      .insert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      })
      .select()
      .single();
    if (error) {
      SupabaseService.logger.error('Error creating session', error);
      throw new Error('Error creating session');
    }

    return data;
  }
}
