export const waitAndRetry = async <T>(
  predicateFn: () => T,
  sleepTime = 20,
  maxRetryCount = 15,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let retryCount = 0
    function performCheck() {
      // amount of retries exceeded
      if (maxRetryCount !== 0 && retryCount > maxRetryCount) {
        resolve(predicateFn())
      }

      // Try executing predicateFn
      Promise.resolve()
        .then(() => {
          return predicateFn()
        })
        .then((result) => {
          if (result) {
            resolve(result)
          } else {
            retryCount++
            setTimeout(performCheck, sleepTime)
          }
        })
        .catch((err) => {
          reject(err)
        })
    }

    performCheck()
  })
}
