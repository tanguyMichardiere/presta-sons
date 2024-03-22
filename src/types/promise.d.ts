// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Promise<T> {
  // replace any with unknown
  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | undefined | null,
  ): Promise<T | TResult>;
}
