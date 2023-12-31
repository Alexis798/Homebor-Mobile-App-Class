import React, {Component} from 'react';
import { View, Image, Platform, Alert, Dimensions } from 'react-native'
import { NativeBaseProvider, Text, Input, Stack, FormControl, Heading, Icon, Button, Slide, Alert as AlertNativeBase, VStack, HStack, Center, WarningOutlineIcon } from 'native-base';
import { ScrollView } from 'react-native-gesture-handler';

import { FontAwesome } from '@expo/vector-icons';

import { FlatList } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Spinner} from 'native-base';
import {Picker} from '@react-native-picker/picker';

import globalStyles from '../styles/global';
import Card from '../shared/card';

import api from '../api/api';
import { StatusBar } from 'expo-status-bar';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Checkbox from 'expo-checkbox';

import NetInfo from "@react-native-community/netinfo";

export default class Requiredfields extends Component {
  NetInfoSubscription = null;

  constructor(props){ 
		super(props); 
			this.state = {
          //Variables 
          email : '',
          perm : false,
          info : [],
          requiredFields : false,

          //Internet Connection
          connection_status: false,
          clockrun : false,

          //Fields
          requiredFields : false,
			} 
	} 
    async componentDidMount(){

        this.NetInfoSubscription = NetInfo.addEventListener(
          this._handleConnectivityChange,
        )
    
        //Get user profile
        let userLogin = await AsyncStorage.getItem('userLogin')
        userLogin = JSON.parse(userLogin)
        this.setState({ email : userLogin.email, perm : userLogin.perm})
        
        //Get user profile (In this file all must be NULL and with that we can put the fields empty in frontend)
        let profile = await api.getBasicdata(this.state.email,this.state.perm)
        this.setState({ info : profile.data, num : profile.data[0].num, room : profile.data[0].room, id : profile.data[0].id_home, idm : profile.data[0].id_m, m_city : profile.data[0].m_city, pet : profile.data[0].pet, ag_pre : profile.data[0].ag_pre, g_pre : profile.data[0].g_pre, type_pet : profile.data[0].type_pet, dog : profile.data[0].dog, cat : profile.data[0].cat, other : profile.data[0].other, pet_num: profile.data[0].pet_num, HouseLName : profile.data[0].l_name_h.toUpperCase(), HouseName : profile.data[0].name_h.toLowerCase(), HouseLowerName : profile.data[0].l_name_h})

        //Checkboxes conditions
        if (this.state.dog == 'yes') {
          this.setState({itemDog : true})
          } else {
              this.setState({itemDog : false}) 
          }
        if (this.state.cat == 'yes') {
              this.setState({itemCat : true})
          } else {
              this.setState({itemCat : false}) 
          }
        if (this.state.other == 'yes') {
              this.setState({itemOther : true})
          } else {
              this.setState({itemOther : false}) 
          }

    }

    //Register to database function
    registerbasici = async () => {
      if(this.state.num == 'NULL' || this.state.room == 'NULL' || this.state.m_city == 'NULL' || this.state.ag_pre == 'NULL' || this.state.g_pre == 'NULL') {
        this.setState({requiredFields : true})
        this.state.verifyFlatlistRef.scrollToIndex({ animated: true, index: 0}) 
      } else {
        let hname = `${this.state.HouseLowerName}, ${this.state.HouseName}`
        api.registerRequiredfields(this.state.id,this.state.email,hname,this.state.num,this.state.room,this.state.m_city,this.state.pet, this.state.pet_num, this.state.itemDog, this.state.itemCat, this.state.itemOther, this.state.type_pet, this.state.ag_pre,this.state.g_pre,this.state.idm)
        let userLogin = {
          email : this.state.email.toLowerCase(),
          perm : true, 
          disableUser: false,
          userRoute: 'Houseinformation',
        }
        AsyncStorage.setItem('userLogin',JSON.stringify(userLogin))
        this.props.navigation.navigate('YourLocation')
      }
    }

    _handleConnectivityChange = (state) => {
      this.setState({ connection_status: state.isConnected, clockrun : true });
      this.Clock()
    }
  
    Clock = () => {
      this.timerHandle = setTimeout (() => {
        this.setState({clockrun : false});
        this.timerHandle = 0;
      }, 5000)
    }

    noInternetConnection = () => {
      Alert.alert('There is no internet connection, connect and try again.')
    }
  
    componentWillUnmount(){
      this.NetInfoSubscription && this.NetInfoSubscription()
      clearTimeout(this.timerHandle)
      this.timerHandle = 0;
    }
    
  render() {

  return (
    <View>
      <StatusBar style="light" translucent={true} />

        <FlatList
            ref={ref => (this.state.verifyFlatlistRef = ref)}
            data={this.state.info}
            extraData={this.state.info}
            keyExtractor={item => `${item.info}`}
            ListFooterComponent={() => this.state.loading ? <Spinner color="purple" style={ globalStyles.spinner2}/> : null}
            nestedScrollEnabled={true}
            bounces={false}
            renderItem={({item}) => (
                <NativeBaseProvider>
                  <Slide in={this.state.connection_status ? false : this.state.clockrun == false ? false : true} placement="top">
                      <AlertNativeBase style={globalStyles.StacknoInternetConnection}  justifyContent="center" status="error">
                      <VStack space={2} flexShrink={1} w="100%">
                      <HStack flexShrink={1} space={2}  justifyContent="center">
                          <Text color="error.600" fontWeight="medium">
                          <AlertNativeBase.Icon />
                          <Text> No Internet Connection</Text>
                          </Text>
                      </HStack>
                      </VStack>
                      </AlertNativeBase>
                  </Slide>

                  <KeyboardAwareScrollView enableOnAndroid enableAutomaticScroll extraScrollHeight={20}>
                    <ScrollView 
                      nestedScrollEnabled={true} 
                      alwaysBounceHorizontal={false}
                      alwaysBounceVertical={false}
                      bounces={false}>
                        <View style={ globalStyles.contenido } >

                          <View style={globalStyles.marginTopRequiredFields}>
                            <Heading size='xl'style={ globalStyles.titulo }>Basic Information</Heading>
                          </View>

                            <FormControl>
                              {/*House Information*/}
                              <Card>
                                {(Dimensions.get('window').width < 414 || (Platform.isPad != true && Platform.OS != 'android')) && (
                                  <Stack alignItems="center" width="100%">
                                    <HStack alignItems="center">
                                        <VStack width="90%">
                                            <View>
                                              <Heading size='md' style={ globalStyles.infomaintitleditNativeBase}>House Information</Heading>
                                            </View>  
                                        </VStack>
                                        <Center size="12" width="10%">
                                            <Image
                                                source={require("../assets/img/editIcons/disponibilidad-16.png")}
                                                resizeMode="contain"
                                                style={globalStyles.editiconsNativeBase}
                                            />
                                        </Center>
                                    </HStack>
                                  </Stack>
                                )}
                                {(Dimensions.get('window').width >= 414 && (Platform.isPad === true || Platform.OS === 'android')) && (
                                    <Stack alignItems="center">
                                      <HStack alignItems="center">
                                        <Center width="30%">
                                          <View>
                                            <Heading size='md' style={ globalStyles.infomaintitleditNativeBase}>House Information</Heading>
                                          </View> 
                                        </Center>
                                        <Center size="12">
                                          <Image
                                                source={require("../assets/img/editIcons/disponibilidad-16.png")}
                                                resizeMode="contain"
                                                style={globalStyles.editiconsNativeBase}
                                          />
                                        </Center>
                                      </HStack>
                                    </Stack>
                                )}

                                <Stack >
                                  <Stack inlineLabel last style={globalStyles.input}>
                                    <FormControl.Label style={ globalStyles.infotitle}>House Name</FormControl.Label>
                                      <Input 
                                            defaultValue={`${this.state.HouseLName}, ${this.state.HouseName.charAt(0).toUpperCase() + this.state.HouseName.slice(1)}`}
                                            placeholder="e.g. John Smith Residence"
                                            style={ globalStyles.inputedit}
                                            variant="filled"
                                            isReadOnly
                                        />
                                  </Stack>


                                  <Stack inlineLabel last style={globalStyles.input}>
                                    <FormControl isInvalid={this.state.requiredFields == true && this.state.num == 'NULL' && true}>
                                      <FormControl.Label style={ globalStyles.infotitle}>Phone Number *</FormControl.Label>
                                        <Input 
                                            defaultValue={item.num == 'NULL' ? '' : item.num}
                                            onChangeText={ (num) => this.setState({num}) }
                                            placeholder="e.g. 55575846"
                                            placeholderTextColor={this.state.requiredFields == true ? "#D81606" : "#979797"}
                                            style={ globalStyles.inputedit}
                                        />
                                        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                          Required.
                                        </FormControl.ErrorMessage>
                                    </FormControl>
                                  </Stack>

                                  <FormControl isInvalid={this.state.requiredFields == true && this.state.room == '0' && true}>
                                    <FormControl.Label style={ globalStyles.infotitle}>Rooms in your House *</FormControl.Label>
                                                
                                      <View style={Platform.OS === 'ios' ? globalStyles.editMargintop : this.state.requiredFields == true && this.state.room == '0' ?  globalStyles.pickerAndroidError : globalStyles.pickerAndroid }>
                                          <Picker
                                              mode="dropdown"
                                              style={globalStyles.pickerBasicinfo}
                                              itemStyle={{height: (Platform.isPad === true) ? 150 : 100, fontSize: (Platform.isPad === true) ? 22 : 18}}
                                              selectedValue={this.state.room == 'NULL' ? "Select"  : this.state.room}
                                              onValueChange={(room) => this.setState({room})}>
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="-- Select --" value="NULL" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="1" value="1" /> 
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="2" value="2" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="3" value="3" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="4" value="4" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="5" value="5" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="6" value="6" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="7" value="7" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.room == '0' ? '#DC2626' : 'black'} label="8" value="8" />
                                          </Picker>
                                      </View>

                                      <FormControl.ErrorMessage style={globalStyles.errormessageEmailLogin} leftIcon={<WarningOutlineIcon size="xs" />}>
                                        Required.
                                      </FormControl.ErrorMessage>
                                    </FormControl>
                                
                                </Stack>

                                <FormControl isInvalid={this.state.requiredFields == true && this.state.m_city == 'NULL' && true}>
                                    <FormControl.Label style={ globalStyles.infotitle}>Main City *</FormControl.Label>
                                                
                                      <View style={Platform.OS === 'ios' ? globalStyles.editMargintop :  this.state.requiredFields == true && this.state.m_city == 'NULL' ? globalStyles.pickerAndroidError : globalStyles.pickerAndroid}>
                                          <Picker
                                              mode="dropdown"
                                              style={globalStyles.pickerBasicinfo}
                                              itemStyle={{height: (Platform.isPad === true) ? 150 : 100, fontSize: (Platform.isPad === true) ? 22 : 18}}
                                              selectedValue={this.state.m_city == 'NULL' ? "Select"  : this.state.m_city}
                                              onValueChange={(m_city) => this.setState({m_city})}>
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="-- Select --" value="NULL" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Toronto" value="Toronto" /> 
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Montreal" value="Montreal" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Ottawa" value="Ottawa" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Quebec" value="Quebec" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Calgary" value="Calgary" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Vancouver" value="Vancouver" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Victoria" value="Victoria" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Waterloo" value="Waterloo" />
                                                  <Picker.Item color={this.state.requiredFields == true && this.state.m_city == 'NULL' ? '#DC2626' : 'black'} label="Guelph" value="Guelph" />
                                          </Picker>
                                      </View>

                                      <FormControl.ErrorMessage style={globalStyles.errormessageEmailLogin} leftIcon={<WarningOutlineIcon size="xs" />}>
                                        Required.
                                      </FormControl.ErrorMessage>
                                  </FormControl>

                                  <FormControl.Label style={ globalStyles.infotitle}>Do you have pets?</FormControl.Label>

                                            
                                  <View style={Platform.OS === 'ios' ? globalStyles.editMargintop : globalStyles.pickerAndroid}>
                                      <Picker
                                          mode="dropdown"
                                          style={globalStyles.pickerBasicinfo}
                                          itemStyle={{height: (Platform.isPad === true) ? 150 : 100, fontSize: (Platform.isPad === true) ? 22 : 18}}
                                          selectedValue={this.state.pet == 'NULL' ? "Select"  : this.state.pet}
                                          onValueChange={(pet) => this.setState({pet})}>
                                              <Picker.Item label="-- Select --" value="NULL" />
                                              <Picker.Item label="Yes" value="Yes" /> 
                                              <Picker.Item label="No" value="No" />
                                      </Picker>
                                  </View>

                                  {this.state.pet == 'Yes' && 
                                    <View>

                                      <Stack inlineLabel last style={globalStyles.input}>
                                        <FormControl.Label style={ globalStyles.infotitle}>How many pets?</FormControl.Label>
                                          <View style={Platform.OS === 'ios' ? globalStyles.editMargintop : globalStyles.pickerAndroid }>
                                            <Picker
                                                mode="dropdown"
                                                style={globalStyles.pickerBasicinfo}
                                                itemStyle={{height: (Platform.isPad === true) ? 150 : 100, fontSize: (Platform.isPad === true) ? 22 : 18}}
                                                selectedValue={this.state.pet_num == 'NULL' ? "Select"  : this.state.pet_num}
                                                onValueChange={ (pet_num) => this.setState({pet_num}) }>
                                                    <Picker.Item label="-- Select --" value="NULL" />
                                                    <Picker.Item label="1" value="1" /> 
                                                    <Picker.Item label="2" value="2" />
                                                    <Picker.Item label="3" value="3" />
                                                    <Picker.Item label="4" value="4" />
                                                    <Picker.Item label="5" value="5" />
                                                    <Picker.Item label="6" value="6" />
                                                    <Picker.Item label="7" value="7" />
                                                    <Picker.Item label="8" value="8" />
                                                    <Picker.Item label="9" value="9" />
                                            </Picker>
                                          </View>
                                    
                                      </Stack>

                                      <FormControl.Label style={ globalStyles.infotitle}>What kind of pets?</FormControl.Label>

                                        <View style={globalStyles.editSelectsSquare}>
                                            <Checkbox  value={this.state.itemDog} onValueChange={(itemDog) => this.setState({itemDog})} color={this.state.itemDog ? '#B70B7B' : undefined} style={{borderColor: "black", size: "5%"}} aria-label="Close"/>
                                            <Text style={globalStyles.labelSelectEdit}>Dogs</Text>
                                        </View>

                                        <View style={globalStyles.editSelectsSquare}>
                                            <Checkbox  value={this.state.itemCat} onValueChange={(itemCat) => this.setState({itemCat})} color={this.state.itemCat ? '#B70B7B' : undefined} style={{borderColor: "black", size: "5%"}} aria-label="Close"/>
                                            <Text style={globalStyles.labelSelectEdit}>Cats</Text>
                                        </View>

                                        <View style={globalStyles.editSelectsSquare}>
                                            <Checkbox  value={this.state.itemOther} onValueChange={(itemOther) => this.setState({itemOther})} color={this.state.itemOther ? '#B70B7B' : undefined} style={{borderColor: "black", size: "5%"}} aria-label="Close"/>
                                            <Text style={globalStyles.labelSelectEdit}>Others</Text>
                                        </View>
                                        
                                        {this.state.itemOther == true &&
                                          <View>
                                            <Stack inlineLabel last style={globalStyles.input}>
                                              <FormControl.Label style={ globalStyles.infotitle}>Specify</FormControl.Label>
                                                <Input 
                                                    defaultValue={item.type_pet == 'NULL' ? '' : item.type_pet}
                                                    onChangeText={ (type_pet) => this.setState({type_pet}) }
                                                    placeholder="e.g. Birds"
                                                    style={ globalStyles.inputedit}
                                                />
                                            </Stack>
                                          </View>
                                      }
                                          
                                    </View>
                                  }

                                <Card>
                                    <View style={globalStyles.editView}>
                                        <Heading size='md' style={ globalStyles.infomaintitledit}>Would you like to receive students?</Heading>
                                    </View>

                                      <FormControl isInvalid={this.state.requiredFields == true && this.state.ag_pre == 'NULL' && true}>

                                          <FormControl.Label style={ globalStyles.infotitle}>Age Preference *</FormControl.Label>

                                              <View style={Platform.OS === 'ios' ? globalStyles.editMargintop :  this.state.requiredFields == true && this.state.ag_pre == 'NULL' ? globalStyles.pickerAndroidError : globalStyles.pickerAndroid}>
                                                  <Picker
                                                      mode="dropdown"
                                                      style={globalStyles.pickerBasicinfo}
                                                      itemStyle={{height: (Platform.isPad === true) ? 150 : 100, fontSize: (Platform.isPad === true) ? 22 : 18}}
                                                      selectedValue={this.state.ag_pre == 'NULL' ? "Select"  : this.state.ag_pre}
                                                      onValueChange={(ag_pre) => this.setState({ag_pre})}>
                                                          <Picker.Item color={this.state.requiredFields == true && this.state.ag_pre == 'NULL' ? '#DC2626' : 'black'} label="-- Select --" value="NULL" />
                                                          <Picker.Item color={this.state.requiredFields == true && this.state.ag_pre == 'NULL' ? '#DC2626' : 'black'} label="Teenager" value="Teenager" /> 
                                                          <Picker.Item color={this.state.requiredFields == true && this.state.ag_pre == 'NULL' ? '#DC2626' : 'black'} label="Adult" value="Adult" />
                                                          <Picker.Item color={this.state.requiredFields == true && this.state.ag_pre == 'NULL' ? '#DC2626' : 'black'} label="Any" value="Any" />
                                                  </Picker>
                                              </View>

                                              <FormControl.ErrorMessage style={globalStyles.errormessageEmailLogin} leftIcon={<WarningOutlineIcon size="xs" />}>
                                                Required.
                                              </FormControl.ErrorMessage>
                                      </FormControl>

                                      <FormControl isInvalid={this.state.requiredFields == true && this.state.g_pre == 'NULL' && true}>
                                        <FormControl.Label style={ globalStyles.infotitle}>Gender Preference *</FormControl.Label>

                                            
                                            <View style={Platform.OS === 'ios' ? globalStyles.editMargintop :  this.state.requiredFields == true && this.state.g_pre == 'NULL' ? globalStyles.pickerAndroidError : globalStyles.pickerAndroid}>
                                                <Picker
                                                    mode="dropdown"
                                                    style={globalStyles.pickerBasicinfo}
                                                    itemStyle={{height: (Platform.isPad === true) ? 150 : 100, fontSize: (Platform.isPad === true) ? 22 : 18}}
                                                    selectedValue={this.state.g_pre == 'NULL' ? "Select"  : this.state.g_pre}
                                                    onValueChange={(g_pre) => this.setState({g_pre})}>
                                                        <Picker.Item color={this.state.requiredFields == true && this.state.g_pre == 'NULL' ? '#DC2626' : 'black'} label="-- Select --" value="NULL" />
                                                        <Picker.Item color={this.state.requiredFields == true && this.state.g_pre == 'NULL' ? '#DC2626' : 'black'} label="Male" value="Male" /> 
                                                        <Picker.Item color={this.state.requiredFields == true && this.state.g_pre == 'NULL' ? '#DC2626' : 'black'} label="Female" value="Female" />
                                                        <Picker.Item color={this.state.requiredFields == true && this.state.g_pre == 'NULL' ? '#DC2626' : 'black'} label="Any" value="Any" />
                                                </Picker>
                                            </View>

                                            <FormControl.ErrorMessage style={globalStyles.errormessageEmailLogin} leftIcon={<WarningOutlineIcon size="xs" />}>
                                              Required.
                                            </FormControl.ErrorMessage>
                                      </FormControl>

                                </Card>

                              </Card>

                              <View>
            
                                  <Button
                                    success
                                    bordered
                                    onPress={this.state.connection_status ? this.registerbasici : this.noInternetConnection}
                                    style={globalStyles.botoneditRequiredFields}
                                  >

                                    <Text style={globalStyles.botonTexto}> Next <Icon as={FontAwesome} name='arrow-right' style={globalStyles.botonTextoDisable}></Icon></Text>
                                  </Button>  

                              </View> 

                            </FormControl>
                        </View>
                        
                    </ScrollView>
                    </KeyboardAwareScrollView>
                
                </NativeBaseProvider>
            )}> 
        </FlatList>
    </View>
  );}}