import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import NewsApi, { Article, ResponseData } from './src/wrappers/newsapi';


const articleStyle = StyleSheet.create({
  article: {
    width: '98%',
    alignSelf: 'center',
    marginBottom: 5,
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#222',
    shadowOffset : { width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 10
  },
  articleWrapper: {
    width: '95%',
    alignSelf: 'center',
    paddingTop: 10,
    paddingBottom: 10
  },
  title: {
    fontWeight: 'bold',
    fontSize: 21
  },
  image: {
    width: 150,
    height: 150
  },
  content: {
    flexDirection: 'row'
  },
  date: {
    color: '#a7a7a7',
    fontSize: 12,
    fontStyle: 'italic'
  },
  author: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  source: {
    fontSize: 12
  }
});

export default function App() {
  const [articles, setArticles] = useState<Array<JSX.Element>>(new Array<JSX.Element>());

  useEffect(() => {
    NewsApi.makeRequest({
      q: "technology"
    }).then(response => {
      response.json().then((data : ResponseData) => {
          const articles = data.articles.map((article: Article, index: number) => {
            console.log(article);
            return <View style={articleStyle.article} key={`Article_${Date.now()}_${index}`}>
              <View style={articleStyle.articleWrapper}>
                <Text style={articleStyle.title}>{article.title}</Text>
                <View style={articleStyle.content}>
                  <Text>{article.description}</Text>
                  <Image style={articleStyle.image} source={{
                    uri: article.urlToImage
                  }}></Image>
                </View>
                <View>
                  <View>
                    <Text style={articleStyle.author}>{article.author}</Text>
                    <Text style={articleStyle.source}>{article.source.name}</Text>
                    <Text style={articleStyle.date}>{new Date(article.publishedAt).toDateString()}</Text>
                  </View>
                </View>
              </View>
            </View>
          });
          setArticles(articles);
      });
    })
  }, []);

  return <View style={{
    backgroundColor: '#ececec'
  }}>
    <ScrollView>
      { articles }
    </ScrollView>
  </View>;
}