// Define a type for classes that can be instantiated
export type Constructable<T = unknown> = new (...args: any[]) => T;

// Define a type for abstract classes or interfaces
export type AbstractConstructable<T> = NewableFunction & { prototype: T };

// Define a type for service identifiers which can be classes, functions, or strings
export type ServiceIdentifier<T = unknown> =
  | Constructable<T>
  | AbstractConstructable<T>
  | CallableFunction
  | string;

export class Singleton {
  private static instance: Singleton;
  private containerMap = new Map<Constructable, any>();

  private constructor() {}

  static getInstance(): Singleton {
    if (!this.instance) {
      this.instance = new Singleton();
    }

    return this.instance;
  }

  get<T = unknown>(input: Constructable<T>): T {
    if (this.containerMap.has(input)) {
      return this.containerMap.get(input);
    }

    const newOne = new input();

    this.containerMap.set(input, newOne);

    return newOne;
  }

  set<K>(k: Constructable<K>, v: any) {
    this.containerMap.set(k, v);
  }

  has<T = unknown>(input: Constructable<T>): boolean {
    return this.containerMap.has(input);
  }

  // New method to destroy and clean all singletons
  destroy() {
    this.containerMap.forEach((value) => {
      // Only destroy objects with a destroy method
      if (value && typeof value.destroy === 'function') {
        value.destroy();
      }
    });

    this.containerMap.clear();
  }
}

export function di<T = unknown>(input: Constructable<T>): T {
  return Singleton.getInstance().get(input);
}
