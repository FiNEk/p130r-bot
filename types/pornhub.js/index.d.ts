declare module "pornhub.js" {
  class Pornhub {
    search(type: "Video" | "Album" | "Gif" | "Pornstar", keyword: string, options?: Options): Promise<SearchResult>;
  }

  class Options {
    // TODO: make actual options class
  }

  class SearchResult {
    public data: PornhubVideo[];
  }

  // TODO: add hierarchy for different return types
  class PornhubVideo {
    public title: string;
    public url: string;
    public duration: string;
    public hd: boolean;
    public premium: boolean;
    public preview: string;
  }

  export = Pornhub;
}
