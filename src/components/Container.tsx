import React from 'react';

interface ContainerProps {
	children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
	return (
		<div className="flex-1 w-full">
			<div className="w-full pb-4 px-4 lg:px-8 h-full flex flex-wrap">
				{children}
			</div>
		</div>
	);
};

export default Container;
