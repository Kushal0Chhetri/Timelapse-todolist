import "./taskHeader.css"; // Make sure to create and import this CSS file.

const TaskHeader = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="task-header">
      <i className="fa-solid fa-bookmark bookmark-icon"></i>
      <div className="header-content">
        <h2>My Tasks</h2>
        <p>{formattedDate}</p>
      </div>
    </header>
  );
};

export default TaskHeader;
