import { finale } from "speedybot-mini";

// Webhook Handlers
export type HookHandler<T = any> = (
  request: Request,
  env: T,
  ctx: ExecutionContext
) => Response | Promise<Response> | void | Promise<void>;

export type Hook<T = any> = {
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT" | string;
  handler: HookHandler;
  validate?(
    request: Request,
    env?: T,
    ctx?: ExecutionContext
  ): { proceed: boolean } | Promise<{ proceed: boolean }>;
};

export type Hooks = {
  [key: string]: Hook | HookHandler;
};

export const Guard = async <T = any>(
  hooks: Hooks,
  request: Request,
  env: T,
  ctx: ExecutionContext
): Promise<Response> => {
  const urlRef = new URL(request.url);
  const { pathname } = urlRef;
  if (pathname in hooks) {
    const ref = hooks[pathname as keyof typeof hooks];
    if (typeof ref === "function") {
      const res = ref(request, env, ctx);
      return (res ? res : finale()) as Response;
    }
    if ("handler" in ref && typeof ref.handler === "function") {
      if ("method" in ref) {
        const { method = "" } = ref;
        if (method.toLowerCase() !== request.method.toLowerCase()) {
          return new Response(
            `Expected method '${method}' rather than '${request.method}'`,
            {
              status: 400,
            }
          );
        }
      }
      if ("validate" in ref && typeof ref.validate === "function") {
        const { proceed } = await ref.validate(request, env, ctx);
        if (proceed) {
          return ref.handler(request, env, ctx) as Response;
        } else {
          return new Response("Validation failed", {
            status: 400,
          });
        }
      }
      const res = ref.handler(request, env, ctx);
      return new Response(finale());
    }
  }
  return new Response(finale());
};
