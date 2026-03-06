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

  public updateHours(newTotalHours: number): void {
    if (newTotalHours >= this.currentHours) {
      this.currentHours = newTotalHours;
      this.reportedAt = new Date();
    } else {
      throw new Error("Yeni sayaç değeri, mevcut sayaç değerinden düşük olamaz.");
    }
  }
}
