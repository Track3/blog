# Zakee's Planet

![GitHub deployments](https://img.shields.io/github/deployments/Track3/blog/production?label=vercel&logo=vercel&style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/Track3/blog?style=flat-square)
[![Powered by](https://img.shields.io/badge/powered%20by-hugo-ff4088?style=flat-square)](https://gohugo.io)

This repo contains everything needed for building my [blog](https://zak.ee) except content files (Markdown files and some images). To get those, you can download the `content.tar.gz` from my [public folder](https://public.zak.ee/).

## How to run

You will need to have [Hugo](https://gohugo.io/) installed to run this repo.

(1) Get the source code by cloning this repo or download it as a zip file directly.

```
$ git clone https://github.com/Track3/blog.git
```

(2) `cd` into the folder then download `content.tar.gz` file and extract it.

```
$ curl -O https://public.zak.ee/content.tar.gz
$ tar -xzf content.tar.gz
```

Now the folder structure should look similar to this:

```
blog
├── archetypes/
├── assets/
├── content/
├── content-static/
├── layouts/
├── static/
└── hugo.toml
```

(3) Run `hugo server` and play around with the code.

```
$ hugo server
```

## Credits

* [Feather](https://github.com/feathericons/feather) | MIT License
* [modern-normalize](https://github.com/sindresorhus/modern-normalize) | MIT License
* [instant.page](https://github.com/instantpage/instant.page) | MIT License

## License

* All "code" is licensed under the MIT license (like HTML templates, CSS/JavaScript code etc.). Everything lives in this repo is MIT licensed.
* All "content" is licensed under [Creative Commons BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0) license (like blog post content, images, videos .etc).

## Q&A

*Q: Can I fork this repo then edit it and use it as my own website?*

**TL;DR** Yes

* You are free to do so because it's MIT licensed.
* It's not recommended because everything is designed for my personal use at the beginning, you may need a lot of work to make it work for your use case.
* Please remove all of my personal information and my commit history before put your website to production.
* It'll be highly appceciated if you can leave a link to this repo or my blog at your website. ❤️
