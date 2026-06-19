/**
 * Reference: pcs-frontend/src/main/modules/steps/controller.ts
 * TODO: HDPD-506
 */
export class GetController {}

export function createGetController(): GetController {
  return new GetController();
}

export function createPostRedirectController(): { post: () => void } {
  return { post: () => undefined };
}

export function createPostController(): { post: () => void } {
  return { post: () => undefined };
}
