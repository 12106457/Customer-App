import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface propType{
    selectedOption:string,
    setSelectOption:React.Dispatch<React.SetStateAction<string>>,
    optionList:any,
}
const HeaderDropdown = ({selectedOption,setSelectOption,optionList}:propType) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selected, setSelected] = useState(selectedOption);
  useEffect(()=>{
    setSelected(selectedOption);
  },[])

  const toggleDropdown = () => setShowOptions(!showOptions);
  const handleSelect = (option: string) => {
    setSelectOption(option)
    setSelected(option);
    setShowOptions(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.selector}>
        <Text style={styles.selectedText}>{selected}</Text>
        <AntDesign name={showOptions ? "up" : "down"} size={16} color="black" />
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.dropdown}>
          {optionList.map((option:any) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleSelect(option)}
              style={styles.option}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
    position: 'relative',
    width:120
  },
  selector: {
    flexDirection: 'row',
    justifyContent:"space-between",
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  selectedText: {
    marginRight: 5,
    fontSize: 18,
  },
  dropdown: {
    position: 'absolute',
    top: 38,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    zIndex: 999,
    width:120
  },
  option: {
    padding: 8,
  },
  optionText: {
    fontSize: 16,
  },
});

export default HeaderDropdown;
