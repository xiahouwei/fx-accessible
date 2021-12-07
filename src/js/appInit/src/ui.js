// 项目ui
import { Tabbar, TabbarItem, Button, Field, Cell, CellGroup, Icon, RadioGroup, Radio, Search, Collapse, CollapseItem, Popup, NumberKeyboard, Checkbox, CheckboxGroup, Tag, Tab, Tabs, List, SwitchCell, AddressEdit, Area, DatetimePicker, Actionsheet, Dialog, Toast, ImagePreview, Swipe, SwipeItem, SwipeCell, PullRefresh, Stepper, Notify, Loading, Uploader } from 'vant'
import vantUiPro from '@/js/vantUiPro/index'
import windUi from '@/components/wind-ui'
import fxCommonUI from '@/components'
import '@/assets/stylus/main.styl'

export default (vue) => {
	vue.use(Tabbar).use(TabbarItem).use(Button).use(Field).use(Cell).use(CellGroup).use(Icon).use(RadioGroup).use(Radio).use(Search).use(Collapse).use(CollapseItem).use(Popup).use(NumberKeyboard).use(Checkbox).use(CheckboxGroup).use(Tag).use(Tab).use(Tabs).use(List).use(SwitchCell).use(AddressEdit).use(Area).use(DatetimePicker).use(Actionsheet).use(Dialog).use(Toast).use(ImagePreview).use(Swipe).use(SwipeItem).use(SwipeCell).use(PullRefresh).use(Stepper).use(Notify).use(Loading).use(Uploader)
	vue.use(windUi)
	vue.use(vantUiPro)
	vue.use(fxCommonUI)
}
