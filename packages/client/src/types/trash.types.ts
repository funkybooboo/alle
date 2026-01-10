export interface TrashItem {
  id: number;
  taskId: string;
  taskText: string;
  taskDate: string;
  taskCompleted: boolean;
  deletedAt: string;
  taskType: 'calendar' | 'someday';
  somedayListId?: number;
}

export interface CreateTrashInput {
  taskId: string;
  taskText: string;
  taskDate: string;
  taskCompleted: boolean;
  taskType: 'calendar' | 'someday';
  somedayListId?: number;
}
