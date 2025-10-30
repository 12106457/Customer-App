import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SeparatorWithLabel = ({title}:any) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{title}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Horizontally aligns the lines and text
    alignItems: 'center', // Centers text vertically
    marginVertical: 20, // Adjust spacing around the separator
  },
  line: {
    flex: 1, // Ensures the lines take equal width
    height: 1, // Thickness of the line
    backgroundColor: 'lightgrey',
  },
  label: {
    marginHorizontal: 10, // Space between the text and the lines
    fontSize: 16,
    fontWeight:"500",
    color: 'grey', // Adjust color based on your theme
  },
});

export default SeparatorWithLabel;