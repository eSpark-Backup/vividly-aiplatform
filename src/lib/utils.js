import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

// Combine clsx and tailwind-merge
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Get the last message from the messages array
export const getLastMessage = (messages) => {
  if (!messages || messages.length === 0) return "No messages";
  return messages.reduce((latest, message) =>
    new Date(message.created_at) > new Date(latest.created_at) ? message : latest
  ).content;
};

// Categorize chat history based on the date
export const categorizeHistory = (history) => {
  const today = [];
  const yesterday = [];
  const last7Days = [];

  const now = new Date();
  const todayDate = now.toISOString()?.split("T")[0]; // Extract YYYY-MM-DD
  const yesterdayDate = new Date(now.setDate(now.getDate() - 1)).toISOString().split("T")[0];

  history?.forEach((chat) => {
    const chatDate = chat?.created_at?.split("T")[0]; // Extract YYYY-MM-DD

    if (chatDate === todayDate) {
      today.push(chat);
    } else if (chatDate === yesterdayDate) {
      yesterday.push(chat);
    } else {
      last7Days.push(chat);
    }
  });

  return { today, yesterday, last7Days };
};
export const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
