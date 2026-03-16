import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYear } from 'src/academic-year/entities/academic-year.entity';
import { ClassAcademicYear } from 'src/class/entities/class-academic-year.entity';
import { Class } from 'src/class/entities/class.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAttendanceScheduleDto } from '../dto/create-attendance-schedule.dto';
import { AttendanceScheduleGroup } from '../entities/attendance-schedule-group.entity';
import { AttendanceSchedule } from '../entities/attendance-schedule.entity';

@Injectable()
export class AttendanceScheduleService {
  constructor(
    @InjectRepository(AttendanceSchedule)
    private readonly scheduleRepository: Repository<AttendanceSchedule>,

    @InjectRepository(AttendanceScheduleGroup)
    private readonly groupRepository: Repository<AttendanceScheduleGroup>,

    @InjectRepository(ClassAcademicYear)
    private readonly classAcademicYearRepository: Repository<ClassAcademicYear>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,

    private readonly dataSource: DataSource,
  ) {}

  async findByClassAndYear(
    classId: string,
    academicYearId: string,
  ): Promise<AttendanceSchedule[]> {
    // Validate class and year exist
    const [classExists, yearExists] = await Promise.all([
      this.classRepository.findOne({ where: { id: classId } }),
      this.academicYearRepository.findOne({ where: { id: academicYearId } }),
    ]);

    if (!classExists) {
      throw new NotFoundException(`Class with id ${classId} not found`);
    }
    if (!yearExists) {
      throw new NotFoundException(
        `Academic year with id ${academicYearId} not found`,
      );
    }

    // Return active schedules
    return this.scheduleRepository.find({
      where: {
        attendanceScheduleGroup: {
          classAcademicYear: {
            classId,
            academicYearId,
          },
        },
        isActive: true,
      },
      order: {
        dayOfWeek: 'ASC',
        checkInStart: 'ASC',
      },
    });
  }

  async create(dto: CreateAttendanceScheduleDto): Promise<AttendanceSchedule> {
    return await this.dataSource.transaction(async (manager) => {
      // Validate class and year exist
      const [classExists, yearExists] = await Promise.all([
        manager.findOne(Class, { where: { id: dto.classId } }),
        manager.findOne(AcademicYear, {
          where: { id: dto.academicYearId },
        }),
      ]);

      if (!classExists) {
        throw new NotFoundException(`Class with id ${dto.classId} not found`);
      }
      if (!yearExists) {
        throw new NotFoundException(
          `Academic year with id ${dto.academicYearId} not found`,
        );
      }

      // Find or create ClassAcademicYear and group
      let classAcademicYear = await manager.findOne(ClassAcademicYear, {
        where: { classId: dto.classId, academicYearId: dto.academicYearId },
        relations: {
          attendanceScheduleGroup: true,
        },
      });

      let group: AttendanceScheduleGroup | null =
        classAcademicYear?.attendanceScheduleGroup || null;

      if (!group) {
        group = manager.create(AttendanceScheduleGroup, {});
        group = await manager.save(group);
      }

      if (!classAcademicYear) {
        classAcademicYear = manager.create(ClassAcademicYear, {
          classId: dto.classId,
          academicYearId: dto.academicYearId,
          attendanceScheduleGroup: group,
        });

        classAcademicYear = await manager.save(classAcademicYear);
      }

      if (!classAcademicYear.attendanceScheduleGroup) {
        const newGroup = manager.create(AttendanceScheduleGroup, {
          classAcademicYear,
        });
        const savedGroup = await manager.save(newGroup);

        classAcademicYear.attendanceScheduleGroup = savedGroup;
        classAcademicYear.attendanceScheduleGroupId = savedGroup.id;
        await manager.save(classAcademicYear);
      }

      // Check for overlapping schedules on the same day
      const existingSchedules = await manager.find(AttendanceSchedule, {
        where: {
          attendanceScheduleGroupId:
            classAcademicYear.attendanceScheduleGroup.id,
          dayOfWeek: dto.dayOfWeek,
          isActive: true,
        },
      });

      const hasOverlap = existingSchedules.some((existing) => {
        const newStart = dto.checkInStart;
        const newEnd = dto.checkOut;
        const existingStart = existing.checkInStart;
        const existingEnd = existing.checkOut;

        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasOverlap) {
        throw new BadRequestException(
          'Schedule overlaps with existing schedule for the same day',
        );
      }

      // Create new schedule
      const schedule = manager.create(AttendanceSchedule, {
        dayOfWeek: dto.dayOfWeek,
        checkInStart: dto.checkInStart,
        checkInEnd: dto.checkInEnd,
        checkOut: dto.checkOut,
        isActive: true,
        attendanceScheduleGroupId: classAcademicYear.attendanceScheduleGroup.id,
      });

      return manager.save(schedule);
    });
  }

  async deactivate(id: string): Promise<AttendanceSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${id} not found`);
    }

    schedule.isActive = false;
    return this.scheduleRepository.save(schedule);
  }

  async bulkCreateSchedules() {
    return await this.dataSource.transaction(async (manager) => {
      // Get all active classes and academic years
      const [classes, years] = await Promise.all([
        manager.find(Class, { where: { isActive: true } }),
        manager.find(AcademicYear, { where: { isActive: true } }),
      ]);

      if (classes.length === 0 || years.length === 0) {
        return {
          success: false,
          message: 'No active classes or academic years found',
          created: 0,
        };
      }

      const scheduleConfig = [
        {
          dayOfWeek: 0,
          checkInStart: '07:30',
          checkInEnd: '07:50',
          checkOut: '14:00',
        }, // Lunes
        {
          dayOfWeek: 1,
          checkInStart: '07:30',
          checkInEnd: '07:50',
          checkOut: '14:00',
        }, // Martes
        {
          dayOfWeek: 2,
          checkInStart: '07:30',
          checkInEnd: '07:50',
          checkOut: '14:00',
        }, // Miércoles
        {
          dayOfWeek: 3,
          checkInStart: '07:30',
          checkInEnd: '07:50',
          checkOut: '14:00',
        }, // Jueves
        {
          dayOfWeek: 4,
          checkInStart: '07:30',
          checkInEnd: '07:50',
          checkOut: '14:00',
        }, // Viernes
        {
          dayOfWeek: 6,
          checkInStart: '21:00',
          checkInEnd: '21:30',
          checkOut: '22:00',
          
        }, // Viernes
      ];

      let createdCount = 0;
      const errors: string[] = [];

      // For each class-year combination
      for (const classItem of classes) {
        for (const year of years) {
          try {
            // Find or create ClassAcademicYear
            let classAcademicYear = await manager.findOne(ClassAcademicYear, {
              where: {
                classId: classItem.id,
                academicYearId: year.id,
              },
              relations: ['attendanceScheduleGroup'],
            });

            // Create group if not exists
            let group = classAcademicYear?.attendanceScheduleGroup;
            if (!group) {
              group = manager.create(AttendanceScheduleGroup, {});
              group = await manager.save(group);
            }

            // Create or update ClassAcademicYear
            if (!classAcademicYear) {
              classAcademicYear = manager.create(ClassAcademicYear, {
                classId: classItem.id,
                academicYearId: year.id,
                attendanceScheduleGroup: group,
              });
              await manager.save(classAcademicYear);
            } else if (!classAcademicYear.attendanceScheduleGroupId) {
              classAcademicYear.attendanceScheduleGroupId = group.id;
              classAcademicYear.attendanceScheduleGroup = group;
              await manager.save(classAcademicYear);
            }

            // Create schedules for each day (Monday-Friday)
            for (const config of scheduleConfig) {
              // Check if schedule already exists
              const existingSchedule = await manager.findOne(
                AttendanceSchedule,
                {
                  where: {
                    attendanceScheduleGroupId: group.id,
                    dayOfWeek: config.dayOfWeek,
                    isActive: true,
                  },
                },
              );

              if (!existingSchedule) {
                const schedule = manager.create(AttendanceSchedule, {
                  dayOfWeek: config.dayOfWeek,
                  checkInStart: config.checkInStart,
                  checkInEnd: config.checkInEnd,
                  checkOut: config.checkOut,
                  isActive: true,
                  attendanceScheduleGroupId: group.id,
                });
                await manager.save(schedule);
                createdCount++;
              }
            }
          } catch (error) {
            errors.push(
              `Error creating schedules for class ${classItem.id} and year ${year.id}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      }

      return {
        success: true,
        message: `Bulk schedule creation completed. Created ${createdCount} schedules.`,
        created: createdCount,
        classesProcessed: classes.length,
        yearsProcessed: years.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    });
  }
}
