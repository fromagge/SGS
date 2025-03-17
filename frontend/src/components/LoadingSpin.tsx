const LoadingSpin = ({
  height = '90%',
  width = 'auto',
  aspectRatio = '1/1',
}: {
  height?: string;
  width?: string;
  aspectRatio?: string;
}) => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div
        className="animate-spin rounded-full 
        border-4 border-gray-200 border-t-4 border-t-purple-400"
        style={{
          height: height,
          width: width,
          aspectRatio: aspectRatio,
        }}
      ></div>
    </div>
  );
};

export default LoadingSpin;
