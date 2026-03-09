import { JobOrder, JobStatus } from "../models/JobOrder";

export class JobOrderService {
  private static readonly MAINTENANCE_INTERVAL_HOURS = 500;
  private static readonly CALENDAR_INTERVAL_DAYS = 30;

  private jobs: JobOrder[] = [];

  // Makine bazında son bakım saatini ve tarihini takip et (dedup için)
  private lastMaintenanceHours: Map<string, number> = new Map();
  private lastCalendarMaintenanceDate: Map<string, Date> = new Map();

  constructor() {
    // Mock başlangıç verisi
    this.jobs.push(
      new JobOrder(
        "JOB-001",
        "Periyodik Bakım",
        "500 saatlik genel bakım.",
        "MCH-1001",
        JobStatus.PENDING,
      ),
    );
    // MCH-1001 için son bakım 11500 saatte yapılmış kabul ediyoruz
    this.lastMaintenanceHours.set("MCH-1001", 11500);
  }

  /**
   * FR-PMS-01: Saat bazlı iş emri üretimi.
   * Eşik geçişi kontrolü: previousHours → currentHours arasında 500'ün katı geçildiyse yeni iş emri üretir.
   * Aynı eşik için tekrar iş emri üretmez (dedup).
   */
  public generateJobsBasedOnHours(
    machineId: string,
    currentHours: number,
  ): void {
    const lastMaint = this.lastMaintenanceHours.get(machineId) ?? 0;
    const interval = JobOrderService.MAINTENANCE_INTERVAL_HOURS;

    // Son bakımdan bu yana kaç interval geçildi?
    const nextThreshold = Math.ceil((lastMaint + 1) / interval) * interval;

    if (currentHours >= nextThreshold) {
      // En yakın geçilen eşik noktası
      const triggeredAt = Math.floor(currentHours / interval) * interval;
      this.createJobOrder(
        machineId,
        "Otomatik Periyodik Bakım (Saat Bazlı)",
        `${triggeredAt} saat eşiği geçildiği için otomatik oluşturuldu. (Güncel: ${currentHours} saat)`,
      );
      this.lastMaintenanceHours.set(machineId, triggeredAt);
    }
  }

  /**
   * FR-PMS-01: Takvim bazlı iş emri üretimi.
   * Her 30 günde bir bakım emri oluşturur, aynı periyot için duplicate oluşturmaz.
   */
  public generateJobsBasedOnCalendar(
    machineId: string,
    lastMaintenanceDate: Date,
  ): void {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastMaintenanceDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= JobOrderService.CALENDAR_INTERVAL_DAYS) {
      // Aynı makine için bu periyotta zaten üretilmiş mi?
      const lastCalendar = this.lastCalendarMaintenanceDate.get(machineId);
      if (lastCalendar) {
        const sinceLast = Math.abs(now.getTime() - lastCalendar.getTime());
        const daysSinceLast = sinceLast / (1000 * 60 * 60 * 24);
        if (daysSinceLast < JobOrderService.CALENDAR_INTERVAL_DAYS) {
          return; // Bu periyot için zaten üretilmiş
        }
      }

      this.createJobOrder(
        machineId,
        "Otomatik Periyodik Bakım (Takvim Bazlı)",
        `Takvim süresi (${JobOrderService.CALENDAR_INTERVAL_DAYS} gün) dolduğu için otomatik oluşturuldu.`,
      );
      this.lastCalendarMaintenanceDate.set(machineId, now);
    }
  }

  /**
   * Yeni iş emri oluşturur (lokal DB simülasyonu).
   */
  public createJobOrder(
    machineId: string,
    title: string,
    description: string,
  ): JobOrder {
    const newId = `JOB-${String(this.jobs.length + 1).padStart(4, "0")}`;
    const newJob = new JobOrder(
      newId,
      title,
      description,
      machineId,
      JobStatus.PENDING,
    );
    this.jobs.push(newJob);
    return newJob;
  }

  /**
   * Belirli makineye ait açık (PENDING) iş emirlerini döner.
   */
  public getOpenJobsForMachine(machineId: string): JobOrder[] {
    return this.jobs.filter(
      (job) => job.machineId === machineId && job.status === JobStatus.PENDING,
    );
  }

  /**
   * Tüm iş emirlerini döner (geçmiş dahil).
   */
  public getAllJobsForMachine(machineId: string): JobOrder[] {
    return this.jobs.filter((job) => job.machineId === machineId);
  }

  /**
   * İş emri durumunu günceller.
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

// Singleton instance
export const jobOrderService = new JobOrderService();
