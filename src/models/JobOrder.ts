export enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class JobOrder {
  public id: string;
  public title: string;
  public description: string;
  public status: JobStatus;
  public machineId: string;
  public createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    machineId: string,
    status: JobStatus = JobStatus.PENDING
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.machineId = machineId;
    this.status = status;
    this.createdAt = new Date();
  }

  public updateStatus(newStatus: JobStatus): void {
    this.status = newStatus;
  }
}
