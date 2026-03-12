import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { PlatformType } from 'src/platform-version/entities/platform-type.entity';
import { PlatformVersion } from 'src/platform-version/entities/platform-version.entity';
import { Repository } from 'typeorm';

const MOBILE_PLATFORMS = ['android', 'ios'];

@Injectable()
export class PlatformVersionMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(PlatformVersion)
    private readonly versionRepo: Repository<PlatformVersion>,

    @InjectRepository(PlatformType)
    private readonly typeRepo: Repository<PlatformType>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const platform = req.headers['platform'] as string | undefined;

    // No platform header → skip validation
    if (!platform) {
      return next();
    }

    const version = req.headers['version'] as string | undefined;
    const build = req.headers['build'] as string | undefined;

    const isMobile = MOBILE_PLATFORMS.includes(platform.toLowerCase());
    const isWeb = platform.toLowerCase() === 'web';

    if (!isMobile && !isWeb) {
      throw new ForbiddenException(`Plataforma desconocida: '${platform}'`);
    }

    // Validate required headers
    if (!version) {
      throw new UnauthorizedException(
        `El header 'version' es requerido para la plataforma '${platform}'`,
      );
    }

    if (isMobile && !build) {
      throw new UnauthorizedException(
        `El header 'build' es requerido para plataformas móviles (${platform})`,
      );
    }

    // Build query
    const query = this.versionRepo
      .createQueryBuilder('pv')
      .where('pv.platformTypeId = :platform', {
        platform: platform.toLowerCase(),
      })
      .andWhere('pv.version = :version', { version });

    if (isMobile) {
      query.andWhere('pv.build = :build', { build });
    }

    const platformVersion = await query.getOne();

    if (!platformVersion) {
      // Fetch storeUrl even when version is not found
      const platformType = await this.typeRepo.findOne({
        where: { id: platform.toLowerCase() },
      });

      throw new ForbiddenException({
        message: `Versión no encontrada: ${platform} v${version}${build ? ` (build ${build})` : ''}`,
        code: ErrorCode.PLATFORM_VERSION_NOT_FOUND,
        storeUrl: platformType?.storeUrl ?? null,
      });
    }

    if (!platformVersion.isActive) {
      throw new ForbiddenException({
        message: `Esta versión de la aplicación (${platform} v${version}${build ? ` build ${build}` : ''}) ya no está soportada. Por favor, actualiza la aplicación.`,
        code: ErrorCode.PLATFORM_VERSION_NOT_ALLOWED,
        storeUrl: platformVersion.platformType?.storeUrl ?? null,
      });
    }

    next();
  }
}
