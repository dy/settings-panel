module.exports = {
	merka: {
		fontFamily: 'sans-serif',
		fontSize: 11,
		background: 'rgb(95, 95, 104)',
		background2: 'rgb(65, 66, 76)',
		foreground: 'rgb(40, 40, 47)',
		primary: 'rgb(22, 151, 255)',
		secondary: 'rgb(255, 255, 255)',

		fieldStyle: `
		`,

		labelPosition: 'left',
		labelWidth: '50%',
		labelStyle: `
			padding-left: 1em;
			text-transform: uppercase;
			letter-spacing: .666ex;
			font-size: .666em;
		`,

		titleStyle: theme => `
			text-transform: uppercase;
			letter-spacing: .888ex;
			font-size: .888em;
			font-weight: bold;
			background: ${theme.background2};
			height: 3em;
			line-height: 3em;
			padding-left: 1em;
			border-radius: .3em;
		`
	},

	light: {
		fontFamily: '"Hack", monospace',
		fontSize: 11,
		background: 'rgb(227,227,227)',
		foreground: 'rgb(105, 105, 105)',
		primary: 'rgb(36,36,36)',
		secondary: 'rgb(36,36,36)',

		fieldStyle: `
		`,

		labelPosition: 'left',
		labelWidth: '33%',
		labelStyle: ``

		// background2: 'rgb(204,204,204)',
		// background2hover: 'rgb(208,208,208)',
		// text2: 'rgb(87,87,87)'
	},

	dark: {
		fontFamily: '"Hack", monospace',
		fontSize: 11,
		background: 'rgb(35,35,35)',
		foreground: 'rgb(112, 112, 112)',
		primary: 'rgb(235,235,235)',
		secondary: 'rgb(235,235,235)',

		fieldStyle: `
		`,

		labelPosition: 'left',
		labelWidth: '33%',
		labelStyle: ''

		// background1: 'rgb(35,35,35)',
		// background2: 'rgb(54,54,54)',
		// background2hover: 'rgb(58,58,58)',
		// text1: 'rgb(235,235,235)',
		// text2: 'rgb(161,161,161)'
	}
}
