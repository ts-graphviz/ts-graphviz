export class E2EError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'E2EError';
  }
}

export class VerdaccioError extends E2EError {
  constructor(message: string, cause?: Error) {
    super(message, 'VERDACCIO_ERROR', cause);
    this.name = 'VerdaccioError';
  }
}

export class PackagePublishError extends E2EError {
  constructor(
    message: string,
    public readonly packageName: string,
    cause?: Error,
  ) {
    super(message, 'PACKAGE_PUBLISH_ERROR', cause);
    this.name = 'PackagePublishError';
  }
}
