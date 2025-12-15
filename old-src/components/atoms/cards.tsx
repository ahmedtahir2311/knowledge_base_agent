import { Link } from "lucide-react";
import React from "react";

const Card = ({
  name,
  description,
  link,
  className,
}: {
  name: string;
  description: string;
  link: string;
  className?: string;
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h2 className='text-lg font-bold'>{name}</h2>
      <p className='text-sm text-gray-500'>{description}</p>
      <div className='flex justify-end'>
        <button>
          <Link href={link}>Chat Now</Link>
        </button>
      </div>
    </div>
  );
};

export default Card;
