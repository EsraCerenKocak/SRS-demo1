import { JobOrder, JobStatus } from '../models/JobOrder';
import { MachineCounter } from '../models/MachineCounter';

export class JobOrderService {
  private static readonly MAINTENANCE_INTERVAL_HOURS = 500;

  // Simulate a database of job orders
  private jobs: JobOrder[] = [];

  constructor() {
    // Adding some mock jobs for testing if needed
    this.jobs.push(
      new JobOrder('JOB-001', 'Periyodik Bakım', '500 saatlik genel bakım.', 'MCH-1001', JobStatus.PENDING)
    );
  }

  /**
   * Generates automatic job orders based on the machine's running hours.
   */
  public generateJobsBasedOnHours(machineId: string, currentHours: number): void {
    if (currentHours > 0 && currentHours % JobOrderService.MAINTENANCE_INTERVAL_HOURS === 0) {
      this.createJobOrder(
        machineId,
        'Otomatik Periyodik Bakım (Saat Bazlı)',
        `${currentHours} saatlik rutin bakım gereksinimi nedeniyle otomatik oluşturuldu.`
      );
    }
  }

  /**
   * Generates automatic job orders based on calendar time (e.g. monthly).
   */
  public generateJobsBasedOnCalendar(machineId: string, lastMaintenanceDate: Date): void {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastMaintenanceDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Örneğin her 30 günde bir takvim bazlı bakım
    if (diffDays >= 30) {
      this.createJobOrder(
        machineId,
        'Otomatik Periyodik Bakım (Takvim Bazlı)',
        `Takvim süresi (30 gün) dolduğu için otomatik oluşturuldu.`
      );
    }
  }

  /**
   * Local DB simulation: create a new job order
   */
  public createJobOrder(machineId: string, title: string, description: string): JobOrder {
    const newId = `JOB-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newJob = new JobOrder(newId, title, description, machineId, JobStatus.PENDING);
    this.jobs.push(newJob);
    return newJob;
  }

  /**
   * Local DB simulation: get open jobs for a machine
   */
  public getOpenJobsForMachine(machineId: string): JobOrder[] {
    return this.jobs.filter(
      (job) => job.machineId === machineId && job.status === JobStatus.PENDING
    );
  }

  /**
   * Local DB simulation: update job status
   */
  public updateJobStatus(jobId: string, status: JobStatus): boolean {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      job.updateStatus(status);
      return true;
    }
    return false;
  }
}

// Singleton instance for the mock app
export const jobOrderService = new JobOrderService();
