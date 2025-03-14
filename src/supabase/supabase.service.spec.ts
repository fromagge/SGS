import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';
import { User, Session } from './types';

// Set environment variables for testing
process.env.SUPABASE_URL = 'https://your-supabase-url.supabase.co';
process.env.SUPABASE_API_KEY = 'your-supabase-api-key';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let cacheManager: Cache;
  let supabaseClient: SupabaseClient;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockSupabaseClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn(),
        }),
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: SupabaseClient,
          useValue: mockSupabaseClient,
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    supabaseClient = module.get<SupabaseClient>(SupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should return cached user if exists', async () => {
      const email = 'test@example.com';
      const cachedUser: User = { id: 1, email, created_at: '2025-01-01' };
      mockCacheManager.get.mockResolvedValue(cachedUser);

      const result = await service.getUser(email);
      expect(result).toEqual(cachedUser);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`user:${email}`);
    });

    it('should fetch user from database if not cached', async () => {
      const email = 'test@example.com';
      const user: User = { id: 1, email, created_at: '2025-01-01' };
      mockCacheManager.get.mockResolvedValue(null);
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({ data: user, error: null });

      const result = await service.getUser(email);
      expect(result).toEqual(user);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if fetching user fails', async () => {
      const email = 'test@example.com';
      mockCacheManager.get.mockResolvedValue(null);
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({ data: null, error: new Error('Error') });

      await expect(service.getUser(email)).rejects.toThrow('Error getting user');
    });
  });

  describe('createOrGetUser', () => {
    it('should return existing user if found', async () => {
      const email = 'test@example.com';
      const user: User = { id: 1, email, created_at: '2025-01-01' };
      jest.spyOn(service, 'getUser').mockResolvedValue(user);

      const result = await service.createOrGetUser(email);
      expect(result).toEqual(user);
    });

    it('should create and return new user if not found', async () => {
      const email = 'test@example.com';
      const user: User = { id: 1, email, created_at: '2025-01-01' };
      
      // Mock getUser to return null (user not found)
      jest.spyOn(service, 'getUser').mockResolvedValue(null);
      
      // Set up a simplified mock for the insert operation
      const insertMock = {
        single: jest.fn().mockResolvedValue({ data: user, error: null })
      };
      
      // Mock the chain of methods with a simpler approach
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(insertMock)
      });

      const result = await service.createOrGetUser(email);
      expect(result).toEqual(user);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if creating user fails', async () => {
      const email = 'test@example.com';
      
      // Mock getUser to return null (user not found)
      jest.spyOn(service, 'getUser').mockResolvedValue(null);
      
      // Set up a simplified mock for the insert operation that returns an error
      const insertMock = {
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Error') })
      };
      
      // Mock the chain of methods with a simpler approach
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(insertMock)
      });

      await expect(service.createOrGetUser(email)).rejects.toThrow('Error getting user');
    });
  });

  describe('getSession', () => {
    it('should return cached session if exists', async () => {
      const userId = 1;
      const cachedSession: Session = { id: 1, user_id: userId, access_token: 'token', refresh_token: 'refresh', created_at: '2025-01-01', device: 'device' };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedSession);

      const result = await service.getSession(userId);
      expect(result).toEqual(cachedSession);
    });

    it('should fetch session from database if not cached', async () => {
      const userId = 1;
      const session: Session = { id: 1, user_id: userId, access_token: 'token', refresh_token: 'refresh', created_at: '2025-01-01', device: 'device' };
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      
      // Replace SupabaseService.getInstance() with mockSupabaseClient
      const singleMock = jest.fn().mockResolvedValue({ data: session, error: null });
      const limitMock = jest.fn().mockReturnValue({ single: singleMock });
      const orderMock = jest.fn().mockReturnValue({ limit: limitMock });
      const eqMock = jest.fn().mockReturnValue({ order: orderMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      
      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const result = await service.getSession(userId);
      expect(result).toEqual(session);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
    });

    it('should throw error if fetching session fails', async () => {
      const userId = 1;
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      
      // Replace SupabaseService.getInstance() with mockSupabaseClient
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: new Error('Error') });
      const limitMock = jest.fn().mockReturnValue({ single: singleMock });
      const orderMock = jest.fn().mockReturnValue({ limit: limitMock });
      const eqMock = jest.fn().mockReturnValue({ order: orderMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
      
      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      await expect(service.getSession(userId)).rejects.toThrow('Error getting session');
    });
  });

  describe('createSession', () => {
    it('should create and return new session', async () => {
      const user: User = { id: 1, email: 'test@example.com', created_at: '2025-01-01' };
      const tokenData = { access_token: 'token', refresh_token: 'refresh' };
      const session: Session = { id: 1, user_id: user.id, access_token: tokenData.access_token, refresh_token: tokenData.refresh_token, created_at: '2025-01-01', device: 'device' };
      
      // Set up a simplified mock for the insert operation
      const insertMock = {
        single: jest.fn().mockResolvedValue({ data: session, error: null })
      };
      
      // Mock the chain of methods with a simpler approach
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(insertMock)
      });

      const result = await service.createSession(user, tokenData);
      expect(result).toEqual(session);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions');
    });

    it('should throw error if creating session fails', async () => {
      const user: User = { id: 1, email: 'test@example.com', created_at: '2025-01-01' };
      const tokenData = { access_token: 'token', refresh_token: 'refresh' };
      
      // Set up a simplified mock for the insert operation that returns an error
      const insertMock = {
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Error') })
      };
      
      // Mock the chain of methods with a simpler approach
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(insertMock)
      });

      await expect(service.createSession(user, tokenData)).rejects.toThrow('Error creating session');
    });
  });
});
