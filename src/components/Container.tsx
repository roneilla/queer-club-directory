import React from 'react';

interface ContainerProps {
	children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
	return (
		<div className="w-full py-4 px-4 lg:px-8 h-full flex flex-wrap">
			{children}
		</div>
	);
};

export default Container;
