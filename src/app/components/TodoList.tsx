"use client";

import { ITask } from "@/types/tasks";
import Task from "@/components/Task";

interface TodoListProps {
  tasks: ITask[];
}
const TodoList: React.FC<TodoListProps> = ({ tasks }) => {
  const renderTasks = () => {
    if (tasks.length > 0) {
      return tasks.map((task) => (
        <Task key={task.id} task={task} />
      ));
    }
    return (
      <tr>
        <td colSpan={2} className="text-center">No task</td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        {/* head */}
        <thead>
          <tr>
            <th>Tasks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {renderTasks()}
        </tbody>
      </table>
    </div>
  );
};

export default TodoList;
