<template>
	<div class="item-info-cell">
		<div class="info-wrap">
			<div class="info-item-wrap">
				<div class="info-item fx-ellipsis">{{itemData.goodsDTO.name}}</div>
				<div class="info-item fx-ellipsis">{{itemData.inHouseDTO.name}}</div>
				<div v-if="itemData.checkFlag === '0'" class="info-item">
					<span>出库数：</span>
					<span>{{itemData.rawAmount}}</span>
					<span>{{itemData.unitDTO.name}}</span>
				</div>
				<div v-else class="info-item">
					<span>订货：</span>
					<span>{{itemData.outOrderAmount}}</span>
					<span>{{itemData.unitDTO.name}}</span>
				</div>
			</div>
			<div v-if="itemData.checkFlag === '0'" class="info-item">
				<van-button
					round
					size="small"
					type="primary"
					:disabled="isDisabled"
					@click="onCompleteClick()">
					验收
				</van-button>
			</div>
			<div v-else class="info-item">
				<span>验收：</span>
				<span>{{itemData.checkAmount}}</span>
				<span>{{itemData.unitDTO.name}}</span>
			</div>
		</div>
		<div class="btn-wrap">
			<div class="icon-wrap pho-btn">
				<van-icon name="photograph" size="20px" color="#538FFD" class="btn-style" @click="onUploadClick()"/>
			</div>
			<div class="icon-wrap">
				<van-icon name="edit" size="20px" color="#538FFD" class="btn-style" @click="onEditClick()"/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ItemCompleteCell',
	props: {
		itemData: {
			type: Object,
			default: () => {
				return {}
			}
		},
		isDisabled: Boolean
	},
	data () {
		return {}
	},
	methods: {
		onEditClick (index) {
			!this.isDisabled && this.$emit('on-edit-click', this.itemData)
		},
		onUploadClick () {
			!this.isDisabled && this.$emit('on-upload-click', this.itemData)
		},
		onCompleteClick () {
			!this.isDisabled && this.$emit('on-complete-click', this.itemData)
		}
	}
}
</script>

<style lang="stylus" scoped>
@import '~$assets/stylus/varsty.styl'
.item-info-cell {
	display: flex
	flex-direction: row
	height: 135px
	position:relative
	border: 1px solid $fxGray
	.info-wrap {
		padding: 5px 6px
		width: 100px
		.info-item-wrap {
			height: 91px
			overflow: auto
		}
		.info-item {
			padding: 5px 0
		}
	}
	.btn-wrap {
		display: flex
		flex-direction: column
		border-left: 1px solid $fxGray
		flex: 1
		.icon-wrap {
			flex: 1
			align-items: Center
			display: flex
			padding: 0px 6px
			.btn-style {
				background: $fxBorder
				padding: 4px
				border-radius: 16px
			}
		}
		.pho-btn {
			border-bottom: 1px solid $fxGray
		}
	}
}
</style>
