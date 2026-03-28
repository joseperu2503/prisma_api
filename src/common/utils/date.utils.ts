const TIMEZONE = 'America/Lima';

export class DateUtils {
  static now(): Date {
    return new Date();
  }

  static getCurrentDate(): string {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: TIMEZONE,
    }); // YYYY-MM-DD
  }

  static getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }); // HH:mm:ss
  }

  static getCurrentDateTime(): string {
    const date = this.getCurrentDate();
    const time = this.getCurrentTime();
    return `${date} ${time}`;
  }

  static getTimeFromDate(date: Date): string {
    return date.toLocaleTimeString('en-GB', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }); // HH:mm:ss
  }

  static getDayOfWeek(): number {
    const date = new Date();

    const day = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
        weekday: 'short',
      }).format(date),
    );

    // JS: Sunday=0 → Saturday=6
    // Queremos: Monday=0 → Sunday=6
    const jsDay = date.getDay();

    return (jsDay + 6) % 7;
  }

  static formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };
}
