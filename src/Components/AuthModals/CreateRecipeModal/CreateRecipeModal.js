import React, { useState } from 'react';
import Modal from 'react-modal';
import { useForm, useFieldArray } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

import database from '../../../firebase/firebase';

import styles from './CreateRecipeModal.module.css';

function CreateRecipeModal() {
	const userId = useSelector((state) => state.auth.userId);
	const [isModalOpen, setIsModalOpen] = useState(true);

	let schema = yup.object().shape({
		title: yup.string().required('Recipe title is required'),
		extendedIngredients: yup
			.array()
			.of(
				yup.object().shape({
					name: yup.string().required('Ingredient must have a name'),
					amount: yup.number().required('Amount is required'),
				})
			)
			.min(1, 'A recipe must have at least one ingredient'),
    analyzedInstructions: yup
      .array().min(1, 'Please add instructions')
	});

	const {
		register,
		control,
		handleSubmit,
		reset,
		clearErrors,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		mode: 'onBlur',
	});

	const {
		fields: ingredientFields,
		append: ingredientAppend,
		remove: ingredientRemove,
	} = useFieldArray({
		control,
		name: 'extendedIngredients',
	});

	const {
		fields: instructionFields,
		append: instructionAppend,
		remove: instructionRemove,
	} = useFieldArray({
		control,
		name: 'analyzedInstructions',
	});

	const submitHandler = (data) => {
		console.log(data);
		const instructions = data.analyzedInstructions.map((step) => step.step);
		const recipe = { ...data, analyzedInstructions: instructions };
		database
			.ref(userId)
			.child(recipe.title)
			.set(recipe)
			.then(() => {
				console.log('recipe saved');
			});
		reset();
	};

	const addIngredient = () => {
		ingredientAppend({});
		clearErrors('extendedIngredients');
	};

	const addInstructions = () => {
		instructionAppend({});
		clearErrors('analyzedInstructions');
	};
	console.log(errors);
	const renderModal = (
		<div className={styles.modal}>
			<h2>Create your recipe</h2>
			<form className={styles.modalForm} onSubmit={handleSubmit(submitHandler)}>
				<input type='hidden' name='id' {...register('id')} value={uuid()} />
				<div className={styles.modalInputWrap}>
					<label>Title</label>
					<input
						placeholder="Recipe's title"
						type='text'
						name='title'
						{...register('title')}
					/>
					<span className={styles.textError}>{errors.title?.message}</span>
				</div>
				<div className={styles.tableWrap}>
					<label>Ingredients</label>
					<table className={styles.tableForm}>
						<thead>
							<tr>
								<th>Name</th>
								<th>Amount</th>
								<th>Unit</th>
								<th>
									<button type='button' onClick={addIngredient}>
										Add ingredient
									</button>
								</th>
							</tr>
						</thead>
						<tbody>
							{ingredientFields.map(({ id }, index) => {
								return (
									<tr key={id}>
										<td>
											<input
												{...register(`extendedIngredients[${index}].name`)}
												name={`extendedIngredients[${index}].name`}
												type='text'
											/>
											<span className={styles.textError}>
												{errors?.extendedIngredients?.[index]?.name?.message}
											</span>
										</td>
										<td>
											<input
												{...register(`extendedIngredients[${index}].amount`)}
												name={`extendedIngredients[${index}].amount`}
												type='number'
											/>
											<span className={styles.textError}>
												{errors?.ingredientFields?.[index]?.amount?.message}
											</span>
										</td>
										<td>
											<input
												{...register(`extendedIngredients[${index}].unit`)}
												name={`extendedIngredients[${index}].unit`}
												type='text'
											/>
										</td>
										<td>
											<button
												type='button'
												onClick={() => ingredientRemove(index)}
											>
												Remove row
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<span className={styles.textError}>
						{errors?.extendedIngredients?.message}
					</span>
				</div>
				<div className={styles.tableWrap}>
					<label>Instructions</label>
					<table className={styles.tableForm}>
						<thead>
							<tr>
								<th className={styles.firstCell}>Step</th>
								<th>
									<button type='button' onClick={addInstructions}>
										Add step
									</button>
								</th>
							</tr>
						</thead>
						<tbody>
							{instructionFields.map(({ id }, index) => {
								return (
									<tr key={id}>
										<td className={styles.firstCell}>
											<textarea
												{...register(`analyzedInstructions[${index}].step`)}
												name={`analyzedInstructions[${index}].step`}
												type='text'
											></textarea>
										</td>
										<td>
											<button
												type='button'
												onClick={() => instructionRemove(index)}
											>
												Remove step
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					<span className={styles.textError}>
						{errors?.analyzedInstructions?.message}
					</span>
				</div>
				<div className={styles.modalInputWrap}>
					<label>Ready in </label>
					<input
						placeholder='The required time'
						type='text'
						name='readyInMinutes'
						{...register('readyInMinutes')}
					/>
					{/* <span>{errors.readyInMinutes?.message}</span> */}
				</div>
				<div className={styles.formSubmitWrap}>
					<button className={styles.formSubmit} type='submit'>
						Submit
					</button>
				</div>
			</form>
		</div>
	);
	return (
		<Modal
			isOpen={isModalOpen}
			closeTimeoutMS={500}
			onRequestClose={() => setIsModalOpen(false)}
			className=''
		>
			{renderModal}
		</Modal>
	);
}

export default CreateRecipeModal;