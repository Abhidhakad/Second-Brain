import { ContentType } from "../models/contentModel";

export const detectLinkType = (link: string): ContentType => {
  try {
    const { hostname } = new URL(link);
    const host = hostname.toLowerCase();

    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      return ContentType.YOUTUBE;
    }

    if (host === "x.com" || host.endsWith("twitter.com")) {
      return ContentType.TWITTER;
    }

    if (host.endsWith("linkedin.com")) {
      return ContentType.Linkedin;
    }

    if (host.endsWith("github.com")) {
      return ContentType.GITHUB;
    }

    if (host.endsWith("reddit.com")) {
      return ContentType.REDDIT;
    }

    return ContentType.OTHERS;
  } catch {
    return ContentType.OTHERS;
  }
};
