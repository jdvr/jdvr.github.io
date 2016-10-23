---
cover: /images/2016/10/cover-mustache-node.JPG
cover_caption: Península de la Magdalena, Santander
id: 205
title: Generating static websites with Mustache and Node
date: 2016-10-07 21:08:39
categories:
  - pet
  - work
  - projects
  - node
  - javascript
  - web
tags:
---

During the past two months I have been working on a new project for a local little company. One of the parts of this projects is to create a simple website.

On this point I started to look for a static site generator on google and I found [staticgen](https://www.staticgen.com/), I tried some of them but no one fit on my need, so I decided to create my own. A lightweight  and simple static site generator, that allows me feel comfortable during the development but doesn't force me to use a set of templates or a determinate folder structure and if one day I need to add some backend framework all my work could be easily adapted as templates.

## The basic setup

After read the Mustache.js [documentation](https://github.com/janl/mustache.js/) I decide to use the Command Line Tool to generate the html files.  I am going to skip the explanation about the npm dependencies and package.json setup and lets start at [this point](https://github.com/jdvr/mustache-static-website/tree/e320fead9d62f77b30aa6dbf1251e5347b7834ee) with the package.json and the basic files. As dependencies we have Mustache, npm-watch and buildify, although some of them seem useless now, they will have an explanation on next paragraph. Now we have two scripts _generate.js_ and _generate-command.js_ and two folders _tpl_ and _generable-pages_.  This dependencies and structure is the process of the  development but I am skipping the steps that lead me to this, to focus just on the result.

## The templates and The views 

In case you don't know how mustache works, there are two parts, the logic-less template which contains the structure with the tags:

```html Mustache Template
...
{{#offers}}
<div class="col-md-4 col-sm-6 col-xs-12">
  <figure class="mg-room">
	  <img src="{{imageUrl}}" alt="img11" class="img-responsive">
	  <figcaption>
	    <h2>{{title}}</h2>
	    <div class="mg-room-rating"><i class="fa fa-star"></i></div>

	    <p>{{description}}</p>
	    <a href="#" class="btn btn-main">
	      {{button}}
	    </a>
	  </figcaption>
	</figure>
</div>
{{/offers}}
....
```

And in the other hand the view which represent the data model for the template:

```javascript Model for offers
{

  "offers":
  [
    {
      "imageUrl": "images/offers/sample1.jpg",
      "title": "Sample Title 1",
      "description": "Sample Description 1",
      "button": "Sample Text Button"
    },
    {
      "imageUrl": "images/offers/sample2.jpg",
      "title": "Sample Title 2",
      "description": "Sample Description 2",
      "button": "Sample Text Button"
    },
  ]
}
```

## How I manage templates

The way I have chosen is to create a _“target”_ template which represent a base file where I include my partials, the partials are mustache template with a common content for many pages or with a business representative part, for instance, I have a partial for navigation bar because it is same for every page and a partial for the budget calculator because it is important for my business, so the index.mustache will look like this:

```html Index page base template
 <!DOCTYPE html>

<html lang="es">
<head>

  {{> head}}

</head>

<body>

  <!-- More html -->

  <div class="nav">
    {{> nav}}
  </div>

  <div class="content">
    {{> budget-calculator}}
  </div>

  <!-- More html -->
</body>
</html>
```

For generating the “index.html” with the mustache command tool it is necessary a command like this:

```sh Mustache CLI command
mustache -p path/to/head.mustache -p path/to/budget-calculator.mustache -p path/to/nav.mustache path/to/a/view.json  path/to/index.mustache > index.html
```

The first step to create this command it is to relate the target template and the partials, for that, we use _“generable-page”_ folder, I have created a file that contains this model:

```javascript index-model.js
var generationData = {};

generationData.partials = [
  "-p tpl/partials/head.mustache",
  "-p tpl/partials/nav.mustache",
  "-p tpl/partials/budget-calculator.mustache"
];
generationData.model = {
    name: "views/index/es/view.json",
    //the order is important on this partials
    partials:[
      ...
    ]
};
generationData.target = "tpl/index.mustache";
generationData.out = "index.html"

module.exports = generationData;
```

A model has  a target template, the partials and the view. To get the command with the generable page model, the _command-generator.js_ that allows us to compose the command that _generate.js_ executes.

## Mustache template with dynamic and compose views

One of the requirements of Mustache cli is a json file that contains the view, that was a problem because I have common view elements on different templates,  so creating json file for each page will duplicate a lot of content on the view files.

At this point I found [buildify](https://github.com/powmedia/buildify), this tool allows me to set a base template and then insert a list of files as the template body. I just have to create a json file for each part of the page and then join them all on a single file before the command is execute. Thats why i specify a name and a few partials in the generation model.


## The summary

A generable-page file contains the generation model: a target, partials for target, the view name, partials for view and the output file.
The tpl folder contains the target templates, like index.mustache and his partials. The structure inside this folder is not important.
With this, I can create any kind of static sites, without themes limits, not oriented to any kind of project (like blog or landing pages), and the result can be easily adapt to a non-static server render project without to much effort.

I hope you like this project, it will be a pleasure for me to hear any feedback about this and answer any question.