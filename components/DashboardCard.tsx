// components/DashboardCard.tsx
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  value: string;
  change: string;
  changeType?: 'positive' | 'negative';
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export default function DashboardCard({ title, value, change, changeType = 'positive' }: CardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-400' : 'text-red-400';

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-md"
      variants={cardVariants}
    >
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-3xl font-semibold text-white mt-2">{value}</p>
      <p className={`text-sm mt-1 ${changeColor}`}>{change} vs last week</p>
    </motion.div>
  );
}