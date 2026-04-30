
import { TaskList } from "./task-list";
import { CleanerPinRequests } from "../cleaner-pin-requests";

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Task List</h1>
      {/* Cleaner App PIN Requests — shows when cleaners request a mobile app login PIN */}
      <div className="mb-6">
        <CleanerPinRequests />
      </div>
      <TaskList />
    </>
  )
}
