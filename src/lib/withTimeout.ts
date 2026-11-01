export function withTimeout<T>(promise: PromiseLike<T>, milliseconds: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), milliseconds)
  })

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  })
}
