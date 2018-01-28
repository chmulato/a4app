import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ArticleService } from './article.service';
import { Article } from './article';

@Component({
   selector: 'app-article',
   templateUrl: './article.component.html',
   styleUrls: ['./article.component.css']
})

export class ArticleComponent implements OnInit { 
   
	//Component properties
   allArticles: Article[];
   statusCode: number;
   requestProcessing = false;
   articleIdToUpdate = null;
   processValidation = false;
   
   //Create form
   articleForm = new FormGroup({
       title: new FormControl('', Validators.required),
       category: new FormControl('', Validators.required)	   
   });
   
   //Create constructor to get service instance
   constructor(private articleService: ArticleService) {
   }

   //Create ngOnInit() and and load articles
   ngOnInit(): void {
	   this.getAllArticles();
   }

   //Fetch all articles
   getAllArticles() {
        this.articleService.getAllArticles()
		  .subscribe(
                data => this.allArticles = data,
                errorCode =>  this.statusCode = errorCode);   
   }

   //Handle create and update article
   onArticleFormSubmit() {
	  
		this.processValidation = true;   
	  	if (this.articleForm.invalid) {
	    	return; //Validation failed, exit from method.
	  	}   
	  
	  	//Form is valid, now perform create or update
      	this.preProcessConfigurations();
	  	let article = this.articleForm.value;
	  	if (this.articleIdToUpdate === null) {  
		
			//Generate article id then create article
        	this.articleService.getAllArticles()
	     		.subscribe(articles => {
			 
					//Generate article id	 
					let maxIndex = articles.length - 1;
					let articleWithMaxIndex = articles[maxIndex];
					let articleId = articleWithMaxIndex.articleId + 1;
					article.articleId = articleId;
			
					//Create article
					this.articleService.createArticle(article)
						.subscribe(successCode => {
							this.statusCode = successCode;
							this.getAllArticles();	
							this.backToCreateArticle();
							},
							errorCode => this.statusCode = errorCode
						);
		 		});		
	  	} else {  			   
			//Handle update article
			article.articleId = this.articleIdToUpdate;
			console.log(article); 		
	    	this.articleService.updateArticle(article)
	      		.subscribe(successCode => {
		            	this.statusCode = successCode;
				    	this.getAllArticles();	
						this.backToCreateArticle();
			    	},
					errorCode => this.statusCode = errorCode
				);
			this.requestProcessing = false;
	  	}
   }

	//Load article by id to edit
   	loadArticleToEdit(articleId: string) {
    	this.preProcessConfigurations();
      	this.articleService.getArticleById(articleId)
	    	.subscribe(article => {
		            this.articleIdToUpdate = article.articleId;   
		            this.articleForm.setValue({ title: article.title, category: article.category });
					this.processValidation = true;
					this.requestProcessing = false;   
		        },
				errorCode =>  this.statusCode = errorCode
			);   
   	}

   	//Delete article
   	deleteArticle(articleId: string) {
    	this.preProcessConfigurations();
      	this.articleService.deleteArticleById(articleId)
	    	.subscribe(successCode => {
		    	//this.statusCode = successCode;
				//Expecting success code 204 from server
				this.statusCode = 204;
				this.getAllArticles();	
				this.backToCreateArticle();
			},
			errorCode => this.statusCode = errorCode
		);    
   }

   	//Perform preliminary processing configurations
   	preProcessConfigurations() {
    	this.statusCode = null;
	  	this.requestProcessing = true;   
   	}

   	//Go back from update to create
   	backToCreateArticle() {
    	this.articleIdToUpdate = null;
      	this.articleForm.reset();	  
	  	this.processValidation = false;
	  	this.requestProcessing = false;
   	}
}
