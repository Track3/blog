<img src="./static/apple-touch-icon.png" alt="logo" width="110" height="110" align="right">

# Zakee's Planet

![GitHub deployments](https://img.shields.io/github/deployments/Track3/blog/production?label=vercel&logo=vercel&style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/Track3/blog?style=flat-square)
[![Powered by](https://img.shields.io/badge/powered%20by-hugo-ff4088?style=flat-square)](https://gohugo.io)

This repo contains everything needed for building my [blog](https://zak.ee) except content files (Markdown files and some images). To get those, you can download the `content.tar.gz` from my [public folder](https://public.zak.ee/).

## How to run

You will need to have [Hugo](https://gohugo.io/) installed to run this repo.

(1) Clone this repo or download it as a zip file directly.

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
* [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) | MIT License

## License

* All "code" is licensed under the Mozilla Public License Version 2.0 (like HTML templates, CSS/JavaScript code etc.). Everything lives in this repo is MPL licensed.
* All "content" is licensed under [Creative Commons BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0) license (like blog post content, images, videos .etc).
* Feel free to [contact](https://zak.ee/about/#find-me-on) me if you have any questions.

## Q&A

*Q: Can I use this repo as a template and adapt it for my own website?*

**TL;DR** Yes.

* Feel free to do so as it's MPL licensed. You can do whatever you want under the MPLv2 license.
* It's not recommended since everything was initially designed for my personal use, adapting it to suit your specific use case may require significant effort.
* Please remove all of my personal information and my commit history before put your website to production.
* It'll be highly appreciated if you could leave a link to this repo or my blog at your website. ❤️
