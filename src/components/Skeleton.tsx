interface SkeletonProps {
	color?: string;
}

const Skeleton = ({ color = 'bg-zinc-700' }: SkeletonProps) => {
	return (
		<div className="p-4 sm:basis-1/2 lg:basis-2/6 w-full">
			<div className={`${color} rounded h-40 `}></div>
		</div>
	);
};

export default Skeleton;
