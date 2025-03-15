
const LoadingSpin = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div
        className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-4 border-t-purple-400"
        style={{
          height: '90%',
          width: 'auto',
          aspectRatio: '1/1',
        }}
      ></div>
    </div>
  );
};

export default LoadingSpin;
