<template>
	<div class="itemRowEdit-popup">
		<w-header :title="`${currentItemData.foodName}-${currentItemData.foodUnitName}`" :leftOptions="leftOptions" @on-click-back="onCloseClick"></w-header>
		<div ref="rowEditContent" class="itemRowEdit-content">
			<van-cell-group>
				<div
					:ref="`count-${index}`"
					:key="`${index}`"
					v-for="(item, index) in currentItemData.details"
					v-show="item.changeType !== 'del'"
					:class="{
						'is-active':rowActive===index
					}"
				>
					<van-cell
						:title="formatterDate(item.reckonDate)"
						value-class="info-item-value"
					></van-cell>
					<van-cell
						v-model="item.foodCount"
						title="预估销量"
						input-align="right"
						value-class="info-item-value"
						@click="onItemClick(index)"
					></van-cell>
				</div>
			</van-cell-group>
		</div>
		<div class="itemRowEdit-bottom">
			<van-button v-if="!isDisabled" class="confirm-btn fx-no-radius" type="primary" @click="onConfirmClick">保存</van-button>
		</div>
		<div v-show="numberKeyboardShow" class="details-number-keyboard">
			<itemNumberKeyboard
				:title="keyboardTitleCompted"
				:amount="keyboardAmountCompted"
				:pointSize="sysPointSize"
				:intLength="numberLength"
				:unit="currentItemData.foodUnitName"
				:unitEdit="false"
				@change="onKeyboardChange"
				@pre="onKeyboardPre"
				@next="onKeyboardNext"
				@hide="onKeyboardHide"
			></itemNumberKeyboard>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import itemNumberKeyboard from '@/components/common/ItemNumberKeyboard.vue'
export default {
	name: 'itemRowEdit',
	components: {
		itemNumberKeyboard
	},
	props: {
		visibleFlag: Boolean,
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	data () {
		return {
			leftOptions: {
				showBackBtn: true,
				preventGoBack: true
			},
			currentItemData: {},
			focusing: false,
			numberKeyboardShow: false,
			rowActive: ''
		}
	},
	computed: {
		...mapState({
			sysPointSize: 'sysPointSize',
			numberLength: 'numberLength',
			maxAmount: 'maxAmount'
		}),
		formatterDate (date) {
			return (date) => {
				if (typeof date === 'number') {
					return this.$fxUtils.setDate(new Date(date))
				} else {
					return ''
				}
			}
		},
		keyboardTitleCompted () {
			if (this.rowActive === '' || !this.currentItemData.details) {
				return ''
			} else {
				let row = this.currentItemData.details[this.rowActive]
				return this.formatterDate(row.reckonDate)
			}
		},
		keyboardAmountCompted () {
			if (this.rowActive === '' || !this.currentItemData.details) {
				return '0'
			} else {
				let row = this.currentItemData.details[this.rowActive]
				return row.foodCount
			}
		}
	},
	watch: {
		visibleFlag: {
			handler (val) {
				if (val) {
					this.numberKeyboardShow = false
					this.rowActive = ''
					this.focusing = false
					let data = JSON.parse(JSON.stringify(this.itemData))
					this.currentItemData = data
					this.currentItemData.details.sort((a, b) => {
						return a.reckonDate - b.reckonDate
					})
				}
			},
			immediate: true
		},
		rowActive (val, oldVal) {
			if (!this.currentItemData.details) {
				return true
			}
			if (oldVal !== '') {
				this.currentItemData.details[oldVal].foodCount = parseFloat(this.currentItemData.details[oldVal].foodCount)
				if (val === '') {
					this.numberKeyboardShow = false
				} else {
					this.scrollToActive(val)
				}
			} else {
				this.scrollToActive(val)
			}
		}
	},
	methods: {
		onCloseClick () {
			this.$emit('update:visibleFlag', false)
		},
		onConfirmClick () {
			if (this.focusing) {
				return false
			}
			this.numberKeyboardShow = false
			this.rowActive = ''
			this.$emit('on-Confirm', this.currentItemData)
			this.$emit('update:visibleFlag', false)
		},
		onCountChange (item) {
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		onCountBlur (item) {
			this.onCheckMoneyOrAmount(item).then(() => {
				this.focusing = false
			}).catch(() => {
				// this.$refs[`count-${index}`][0].setFocus()
				this.focusing = true
			})
		},
		onCheckMoneyOrAmount (item, tips = true) {
			return new Promise((resolve, reject) => {
				let error = '不符合规则'
				// 数量大于0
				if (item.foodCount <= 0) {
					this.$nextTick(() => {
						if (tips) {
							let message = '数量必须大于0！'
							this.$fxNotify.fail(message)
						}
						reject(error)
					})
				} else {
					resolve()
				}
			})
		},
		onItemClick (index) {
			if (this.isDisabled || this.focusing) {
				return false
			}
			this.rowActive = index
			this.numberKeyboardShow = true
		},
		onKeyboardChange (val) {
			let item = this.currentItemData.details[this.rowActive]
			item.foodCount = val
			if (item.id) {
				item.changeType = 'edit'
			}
		},
		onKeyboardPre () {
			if (!this.rowActive) {
				return false
			}
			this.onCheckMoneyOrAmount(this.currentItemData.details[this.rowActive]).then(() => {
				this.rowActive--
			}).catch(() => {
				this.focusing = true
			})
		},
		onKeyboardNext () {
			if (this.rowActive === '' || this.rowActive === this.currentItemData.details.length - 1) {
				return false
			}
			this.onCheckMoneyOrAmount(this.currentItemData.details[this.rowActive]).then(() => {
				this.rowActive++
			}).catch(() => {
				this.focusing = true
			})
		},
		onKeyboardHide () {
			this.onCheckMoneyOrAmount(this.currentItemData.details[this.rowActive]).then(() => {
				this.rowActive = ''
			}).catch(() => {
				this.focusing = true
			})
		},
		scrollToActive (index) {
			this.$nextTick(() => {
				this.onSelectLetter(index, 20)
			})
		},
		onSelectLetter (index, distance = 40) {
			let detailsRowRef = this.$refs[`count-${index}`]
			if (!detailsRowRef || detailsRowRef.length === 0) {
				return false
			}
			let offsetTop = detailsRowRef[0].offsetTop - 5
			let $el = this.$refs['rowEditContent']
			this.$fxUtils.scrollTopW({ offsetTop, $el, distance })
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.itemRowEdit-popup {
	height:100%
	width: 100%
	text-align:left
	display: flex
	flex-direction: column
	.itemRowEdit-content {
		flex:1
		overflow:scroll
		.info-item-value {
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.info-cell-img {
			padding: 0
		}
		.info-item-img {
			padding:0 10px 15px 50px
			box-sizing:border-box
			&>img {
				width:100%
				height:100%
			}
		}
		.is-active {
			border-color: $fxDefaultColor
			border-top-width: 1px
			border-top-style: solid
			border-bottom-width: 1px
			border-bottom-style: solid
		}
	}
	.itemRowEdit-bottom {
		display: flex
		flex-direction: row
		width:100%
		.confirm-btn {
			flex:1
		}
	}
	.text-tax .info-item-value {
		color: $fxTextColor;
	}
}
</style>
