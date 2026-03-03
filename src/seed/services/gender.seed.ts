import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gender } from 'src/common/entities/gender.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenderSeed {
  constructor(
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
  ) {}

  genders = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
  ];

  async run() {
    for (const gender of this.genders) {
      await this.create(gender as Gender);
    }
  }

  async create(params: Gender) {
    const { id, name } = params;

    // prefer lookup by primary id
    const isExist = await this.genderRepository.findOne({
      where: { id },
    });

    if (isExist) {
      isExist.name = name;
      return this.genderRepository.save(isExist);
    } else {
      const newGender = this.genderRepository.create(params);
      return this.genderRepository.save(newGender);
    }
  }
}
