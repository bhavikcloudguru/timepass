export interface LoaderState {
  show: boolean;
  type: string;
  message: string;
}

export interface ILoaderService {
  show(type?: string, message?: string);
  hide();
}
