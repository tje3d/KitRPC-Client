import { shareIt } from '$lib/helpers/rxjs.helper';
import { generateId } from '$lib/helpers/utils.helper';
import JsonWorker from '$lib/workers/json.worker?worker&inline';
import {
  combineLatest,
  delay,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap
} from 'rxjs';

export const jsonWorker = new Observable<Worker>((observer) => {
  const worker = new JsonWorker();

  observer.next(worker);

  return () => {
    worker.terminate();
  };
}).pipe(shareIt());

export function jsonDecodeWorker<T>(data: string) {
  return jsonWorker.pipe(
    switchMap((worker) => {
      const id = generateId();

      const sender = of(true).pipe(
        delay(1),
        tap(() => worker.postMessage({ id, type: 'decode', data }))
      );

      const onMessage = fromEvent<MessageEvent>(worker, 'message').pipe(
        filter((e) => e.data.id === id),
        take(1)
      );

      return combineLatest([onMessage, sender]).pipe(map(([message]) => message.data.data as T));
    }),
    take(1)
  );
}

export function jsonEncodeWorker<T>(data: any) {
  return jsonWorker.pipe(
    switchMap((worker) => {
      const id = generateId();

      const sender = of(true).pipe(
        delay(1),
        tap(() => worker.postMessage({ id, type: 'encode', data }))
      );

      const onMessage = fromEvent<MessageEvent>(worker, 'message').pipe(
        filter((e) => e.data.id === id),
        take(1)
      );

      return combineLatest([onMessage, sender]).pipe(map(([message]) => message.data.data as T));
    }),
    take(1)
  );
}
