export class MachineCounter {
  public id: string;
  public machineId: string;
  public currentHours: number;
  public reportedAt: Date;

  constructor(id: string, machineId: string, currentHours: number) {
    this.id = id;
    this.machineId = machineId;
    this.currentHours = currentHours;
    this.reportedAt = new Date();
  }

  public incrementHours(hoursAdded: number): void {
    if (hoursAdded > 0) {
      this.currentHours += hoursAdded;
      this.reportedAt = new Date();
    }
  }

  /**
   * Validates if the new hours are physically possible locally.
   * Compares the time elapsed since the last report and maximum possible hours (e.g. 24h per day).
   */
  public validateNewHoursLocal(newTotalHours: number): { isValid: boolean, message?: string } {
    if (newTotalHours <= this.currentHours) {
      return { isValid: false, message: "Yeni sayaç saati, öncekinden küçük veya eşit olamaz." };
    }

    const now = new Date();
    // Calculate the difference in hours between now and the last reported time
    const diffMs = now.getTime() - this.reportedAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // The increase in counter
    const hoursAdded = newTotalHours - this.currentHours;

    // We allow a small tolerance, e.g. 25 hours per day, effectively meaning hoursAdded cannot exceed diffHours + 1
    // For extreme testing (like if they try to enter 1000 hours in 1 minute):
    if (hoursAdded > diffHours + 1) { // 1 hour tolerance
       // However, to permit manual demonstration testing more easily, we might restrict it to max 24h per day. 
       // If difference is small (e.g. 0 hours), they can't add more than 1.
       return { isValid: false, message: `Lokal Hata: Mantıksız değer. ${Math.round(diffHours)} saat içinde ${hoursAdded} saat çalışılmış olamaz!` };
    }

    return { isValid: true };
  }

  public updateHours(newTotalHours: number): void {
    if (newTotalHours >= this.currentHours) {
      this.currentHours = newTotalHours;
      this.reportedAt = new Date();
    } else {
      throw new Error("Yeni sayaç değeri, mevcut sayaç değerinden düşük olamaz.");
    }
  }
}
