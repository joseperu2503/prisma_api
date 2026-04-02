import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanConfigurationDto } from './create-plan-configuration.dto';

export class UpdatePlanConfigurationDto extends PartialType(CreatePlanConfigurationDto) {}
