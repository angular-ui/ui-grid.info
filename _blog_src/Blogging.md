
# UI-Grid.info Blog

The "blog" uses [hexo](http://hexo.io) to generate a pretty simple static site.

## Installing

To use it you need to install hexo:

    npm install -g hexo@2.8.3

Then install dependencies in both the parent and _blog_src directories. This needs to be done bcause hexo's cwd needs to be the blog source directory.

    npm install
    cd _blog_src
    npm install

Then go back up and run the dev task:

    cd ..
    grund dev

You'll get a server running on [http://localhost:4000](http://localhost:4000) with auto-watch on the blog directory to rebuild when you change files.

## Creating Posts

New posts can be created in `_blog_src/source/_posts` or by running `hexo new` in _blog_src. You can find further documentation on hexo's site: http://hexo.io