'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// Because there is a reference this inside the function. We want the 'this' of the new article made by the constructor.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // The line below is a ternary function. The question mark represents the 'if' statement and the colon separates the true and false responses and the statement before the question mark represents the condition statement.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// It's called in the 'Article.fetchAll' function. 'rawData' represents all the blog article data. Before it was a declared variable in a seperate js file that was called on the same page. Now it's in a different file that is not being initiated on any page.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))

  articleView.initIndexPage();

  Article.setToLocalStorage();
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {

  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  // We decided to put the 'Article.fetchAll()' in the index.html and the '.initIndexPage()' function in the '.loadAll()' that is called by the 'Article.fetchAll()'  because we wanted to be sure that all the articles are retrieved before we render the index page.

  if (localStorage.rawData) {

    let data = JSON.parse(localStorage.rawData)

    Article.loadAll(data);

    console.log('loaded from local storage');

  } else {
    let url = '../data/hackerIpsum.json';

    $.getJSON(url)
      .then( data => Article.loadAll(data))
      .catch( err => console.error('You Suck', err) );

    console.log('loaded from database');

  }
}

Article.setToLocalStorage = () => {
  let rawDataJSON = JSON.stringify(Article.all);
  localStorage.setItem('rawData', rawDataJSON);
}


