import React, { Component } from 'react';
import { Card, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import { Rating } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, TextInput } from 'react-native';


const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
})

function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {

        return (
            <View key={index} style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text>
                <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

class RenderDish extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
            author: '',
            comment: '',
            rating: 0,
        }
    }

    toggleModal() {
        this.setState({ isModalOpen: !this.state.isModalOpen });
    }

    showModal() {
        this.setState({ isModalOpen: true });
    }

    handleComment() {

        this.props.postComment(this.props.dishId, this.state.rating, this.state.author, this.state.comment);
        this.toggleModal()
    }



    render() {
        const dish = this.props.dish;

        const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
            if (dx < -200)
                return true;
            else
                return false;
        }

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (e, gestureState) => {
                return true;
            },
            onPanResponderEnd: (e, gestureState) => {
                console.log("pan responder end", gestureState);
                if (recognizeDrag(gestureState))
                    Alert.alert(
                        'Add Favorite',
                        'Are you sure you wish to add ' + dish.name + ' to favorite?',
                        [
                            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                            { text: 'OK', onPress: () => { props.favorite ? console.log('Already favorite') : props.onPress() } },
                        ],
                        { cancelable: false }
                    );

                return true;
            }
        })

        if (dish != null) {
            return (
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                    {...panResponder.panHandlers}>
                    <Card
                        featuredTitle={dish.name}
                        image={{ uri: baseUrl + dish.image }}>
                        <Text style={{ margin: 10 }}>
                            {dish.description}
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                            <Icon
                                raised
                                reverse
                                name={this.props.favorite ? 'heart' : 'heart-o'}
                                type='font-awesome'
                                color='#f50'
                                onPress={() => this.props.favorite ? console.log('Already favorite') : this.props.onPress()}
                            />
                            <Icon
                                raised
                                reverse
                                name='pencil'
                                type='font-awesome'
                                color="#512DA8"
                                onPress={() => this.showModal()}
                            />

                            <Modal animationType={"slide"} transparent={false}
                                visible={this.state.isModalOpen}
                                onDismiss={() => this.toggleModal()}
                                onRequestClose={() => this.toggleModal()}>
                                <View style={styles.modal}>


                                    <Rating
                                        showRating

                                        style={{ paddingVertical: 10 }}

                                        onFinishRating={(value) => this.setState({ rating: value })}
                                    />

                                    <View style={styles.inputTextIcon}>
                                        <Icon
                                            raised
                                            reverse
                                            name='user'
                                            type='font-awesome'
                                            size={20}
                                        />
                                        <TextInput
                                            placeholder="Author"
                                            onChangeText={text => { this.setState({ author: text }) }}

                                        />
                                    </View>
                                    <View style={styles.inputTextIcon}>

                                        <Icon
                                            raised
                                            reverse
                                            name='comment'
                                            type='font-awesome'
                                            size={20}
                                        />
                                        <TextInput
                                            placeholder="Comment"
                                            onChangeText={text => { this.setState({ comment: text }) }}

                                        />
                                    </View>
                                    <View style={{ marginTop: 30, marginBottom: 30 }}>
                                        <Button
                                            onPress={() => { this.handleComment() }}
                                            color="#512DA8"
                                            title="Submit"

                                        />
                                    </View>

                                    <Button
                                        onPress={() => { this.toggleModal(); }}
                                        color="#757575"
                                        title="Cancel"
                                    />
                                </View>
                            </Modal>
                        </View>

                    </Card>
                </Animatable.View>
            );
        }
        else {
            return (<View></View>);
        }
    }

}

class Dishdetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            myComment: {}
        }
    }
    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }


    static navigationOptions = {
        title: 'Dish Details'
    };

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');
        return (
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    postComment={this.props.postComment}
                    dishId={dishId}
                />

                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({

    modal: {
        justifyContent: 'center',
        margin: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    },
    inputTextIcon: {
        flexDirection: "row"

    }
})
export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);