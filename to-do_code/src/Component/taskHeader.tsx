const TaskHeader = () => {
  const today = new Date();
  const date =
    today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear();

  return (
    <header className="text-center">
      <h2>{"To-do List"}</h2>
      <p>{date}</p>
    </header>
  );
};

export default TaskHeader;
