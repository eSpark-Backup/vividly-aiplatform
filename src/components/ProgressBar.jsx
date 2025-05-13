import { Progress } from "./ui/progress";

const ProgressBar = ({ title, userCount, maxCount }) => {
  return (
    <div className="text-center text-sm text-white  mb-4 space-y-2">
      <p>
        {userCount} / {maxCount} {title}
      </p>
      <Progress
        className="h-1 dark:bg-white/10 bg-white"
        value={
          (userCount / maxCount) * 100
        }
      />
    </div>
  );
};

export default ProgressBar;
