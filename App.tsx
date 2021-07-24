import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import NewsApi, { Article, ResponseData } from './src/wrappers/newsapi';

export default function App() {
  const [articles, setArticles] = useState<Array<JSX.Element>>(new Array<JSX.Element>());

  useEffect(() => {
    NewsApi.makeRequest({
      q: "technology",
      to: "2021-07-23"
    }).then(response => {
      response.json().then((data : ResponseData) => {
          const articles = data.articles.map((data: Article, index: number) =>
            <View key={index}>
              <Image style={{
                height: 250,
                width: 250
              }} source={{
                uri: data.urlToImage
              }}/>
              <Text>{data.title}</Text>
              <Text>{data.content}</Text>
              <Text>{data.author}</Text>
            </View>
          );

          console.log(articles);
          setArticles(articles);
      });
    })
  }, []);

  return <View>
    { articles }
  </View>;
}