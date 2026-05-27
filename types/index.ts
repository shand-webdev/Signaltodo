export type PriorityType = "Must Do" | "Should Do" | "Can Wait";

export interface LifeTask {
  task: string;
  dimension:
    | "Startup"
    | "Career"
    | "Health"
    | "Finance"
    | "Relationships"
    | "Creativity"
    | "Learning"
    | "Content"
    | "Personal"
    | "Home"
    | "Networking"
    | "Admin";
  priority: PriorityType;
  reason: string;
}

export interface SignalResponse {
  must: LifeTask[];
  should: LifeTask[];
  wait: LifeTask[];
  summary: string;
}
